import { useAccount } from "wagmi";
import React, { useCallback, useState } from "react";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { BaseError } from "viem";
import { Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getUIMessageFromViemBaseError } from "@/utils/getUIMessageFromViemBaseError";
import nodePurchaseExecutor, { NodePurchaseState } from "@/services/nodePurchaseExecutor";
import { handleBackendError } from "@/services/backend-errors/backendErrorHandling";
import ButtonLoadable from "@/components/shared/ButtonLoadable";

export function NodesPurchaseButton(
  props: {
    amount: number,
    referralCode: string,
    disabled: boolean,
    disabledText?: string | null,
    isExecutingPurchase: boolean,
    setIsExecutingPurchase: (isExecutingPurchase: boolean) => void,
    onPurchasedFailed: (error: string) => void
    onPurchasedSucceeded: () => void
  }) {

  const web3Account = useAccount();
  const addRecentTransaction = useAddRecentTransaction();
  //const undeliveredTransactions = useUndeliveredTransactions();

  const [state, setState] = useState<NodePurchaseState>(NodePurchaseState.Idle);
  const [error, setError] = useState<string | null>(null);

  let buttonEnabled = !props.disabled;
  if (web3Account.isConnected) {
    buttonEnabled = buttonEnabled && state == NodePurchaseState.Idle;
  }

  const executePurchase = useCallback(async (): Promise<string> => {
    const transactionHash = await nodePurchaseExecutor.createAndSendNodePurchaseTransaction(
      web3Account.address!,
      props.amount,
      props.referralCode,
      setState,
      addRecentTransaction
    );

    await nodePurchaseExecutor.confirmNodePurchaseTransaction(transactionHash, setState);

    return transactionHash;
  }, [addRecentTransaction, props.amount, props.referralCode, web3Account.address])

  const onClick = useCallback(async () => {
    try {
      setError(null);

      if (!web3Account.isConnected) {
        setError("Wallet is disconnected, please check if you are logged in");
        return;
      }

      props.setIsExecutingPurchase(true);
      console.info("Start executing purchase");
      const transactionHash = await executePurchase();
      setState(NodePurchaseState.Success);
      //undeliveredTransactions.remove(mainTransactionResult.hash);
      console.log("Purchase confirmed", transactionHash);

      props.onPurchasedSucceeded();
    } catch (error: any) {
      let errorMessage: string | null;
      if (error instanceof BaseError) {
        errorMessage = getUIMessageFromViemBaseError(error);
      } else {
        errorMessage = handleBackendError(error)?.message;
        if (!errorMessage) {
          errorMessage = error.message;
        }
      }

      console.error(error);

      setError(errorMessage);
      setState(NodePurchaseState.Idle);

      toast.error("Purchase failed: " + errorMessage)
    } finally {
      props.setIsExecutingPurchase(false);
    }
  }, [executePurchase, props, web3Account.isConnected]);

  return (
    <>
      {error && (
        <motion.div
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          style={{
            //marginBottom: "1rem"
          }}
          className="mt-3"
        >
          <Alert variant="danger">{error}</Alert>
        </motion.div>
      )}

      <div className="animated-edge-button-wrapper mt-3 mb-4">
        <ButtonLoadable
          className="action-button animated-edge-button"
          onClick={onClick}
          disabled={!buttonEnabled}
          loading={props.isExecutingPurchase}
          loadingChildren={<>
            {state == NodePurchaseState.CreatingTransaction && <>Preparing...</>}
            {state == NodePurchaseState.SendingTransaction && <>Signing...</>}
            {state == NodePurchaseState.WaitingForTransaction && <>Confirming transaction...</>}
            {state == NodePurchaseState.ConfirmingPurchase && <>Confirming purchase...</>}
            {state == NodePurchaseState.Success && <>Purchased successfully!</>}
          </>}
        >
          {state == NodePurchaseState.Idle && <>
            {props.disabled && props.disabledText && <>{props.disabledText}</>}
            {(!props.disabled || (props.disabled && !props.disabledText)) && <>Purchase</>}
          </>}
        </ButtonLoadable>
      </div>
    </>
  );
}
