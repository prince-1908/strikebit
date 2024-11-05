import { Address, parseTransaction, TransactionSerializedGeneric } from "viem";
import { estimateGas, getBalance, sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import clientApiServices from "@/services/clientApiServices";
import wagmiConfig from "@/providers/web3/wagmiConfig";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

export enum NodePurchaseState {
  Idle,
  CreatingTransaction,
  SendingTransaction,
  WaitingForTransaction,
  ConfirmingPurchase,
  Success
}

const confirmNodePurchaseTransaction = async(
  transactionHash: string,
  setState: (state: NodePurchaseState) => void,
) => {
  setState(NodePurchaseState.ConfirmingPurchase);
  console.info("Confirming purchase");

  await clientApiServices.distribrainNodesApi.nodesControllerPostConfirmPurchaseTransaction(transactionHash);
}

const createAndSendNodePurchaseTransaction = async (
  buyerAddress: Address,
  amount: number,
  referralCode: string,
  setState: (state: NodePurchaseState) => void,
  addRecentTransaction: ReturnType<typeof useAddRecentTransaction>,
) => {
  setState(NodePurchaseState.CreatingTransaction);

  console.info("Creating unsigned purchase transaction");

  const createPurchaseTransactionResult =
    await clientApiServices.distribrainNodesApi.nodesControllerPostCreatePurchaseTransaction({
    amount: amount,
    address: buyerAddress,
    referralCode: referralCode
  });

  const unsignedTransactionHex = createPurchaseTransactionResult.data.unsignedTransactionHex;
  const unsignedTransaction = parseTransaction(<TransactionSerializedGeneric>unsignedTransactionHex);

  const nativeEvmTokenBalance = await getBalance(wagmiConfig.config, {
    address: buyerAddress as Address,
  })

  if (nativeEvmTokenBalance.value < unsignedTransaction.gas!)
    throw new Error("Insufficient balance to cover the gas fee");

  console.log("Calling prepareSendTransaction()");

  const gasEstimateSlackMultiplier = BigInt(115);
  const gasEstimateSlackDivisor = BigInt(100);
  const gasLimit = unsignedTransaction.gas! * gasEstimateSlackMultiplier / gasEstimateSlackDivisor;

  const transactionParameters = {
    to: unsignedTransaction.to!,
    gas: gasLimit,
    data: unsignedTransaction.data as any,
    value: unsignedTransaction.value!,
    chainId: unsignedTransaction.chainId as any,
  }
  const transactionGasEstimate = await estimateGas(wagmiConfig.config, transactionParameters);
  if (nativeEvmTokenBalance.value < transactionGasEstimate)
    throw new Error("Insufficient balance to cover the gas fee");

  setState(NodePurchaseState.SendingTransaction);

  console.info("Sending transaction");

  const transactionHash = await sendTransaction(wagmiConfig.config, {
    ...transactionParameters,
    gas: transactionGasEstimate
  });
  console.info("signedTransaction.hash: " + transactionHash);

  /*const undeliveredTransaction: IUndeliveredTransaction = {
    transactionHash: sendTransactionResult.hash,
    feeTransactionHash: null
  };
  undeliveredTransactions.add(undeliveredTransaction);*/

  setState(NodePurchaseState.WaitingForTransaction);

  const maxWaitAttempts = 4;
  for (let i = 1; i <= maxWaitAttempts; i++) {
    try {
      console.info(`Waiting for transaction (attempt ${i})`);
      await waitForTransactionReceipt(wagmiConfig.config, {
        hash: transactionHash,
        confirmations: 3
      });
      break;
    } catch (err: any) {
      if (i != maxWaitAttempts) {
        console.warn(`waitForTransaction failed (attempt ${i})`, err)
      } else {
        console.error(`waitForTransaction failed (attempt ${i})`, err);

        // Do not throw and hope the transaction will get handled by backend
        //throw err;
      }

      await new Promise(r => setTimeout(r, 1500));
    }
  }

  addRecentTransaction({
    hash: transactionHash,
    description: `Purchase ${amount} DistriBrain Engines`
  })

  console.log("Completed executing purchase transaction");

  return transactionHash;
}

const executor = {
  createAndSendNodePurchaseTransaction,
  confirmNodePurchaseTransaction
}

export default executor;