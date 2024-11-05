import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import clientApiServices from "@/services/clientApiServices";
import wagmiConfig from "@/providers/web3/wagmiConfig";
import { useAccount, useReadContract } from "wagmi";
import { formatTokenAmountUI } from "@/utils/formatTokenAmountUI";
import { Alert, Form, InputGroup, Spinner, Stack } from "react-bootstrap";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { uiPercentageNumberNiceFormat } from "@/utils/uiNiceFormat";
import { defaultErrorHandler } from "@/utils/defaultErrorHandler";
import { Address, erc20Abi } from "viem";
import { UserNodesAccountSummaryDto } from "@/generated/distribrain-nodes-api";
import ButtonLoadable from "@/components/shared/ButtonLoadable";
import { DialogConfig, useGenericConfirmationDialog } from "@/components/dialogs/GenericConfirmationDialog";
import commonTerms from "@/data/commonTerms";

interface WithdrawNodesHoldingRewardsDialogOpenProps {
  userNodesSummary: UserNodesAccountSummaryDto | null,
  holdingRewardTokenAddress: string;
  holdingRewardTokenDecimals: number;
  holdingRewardEarlyWithdrawalPenaltyBps: number;
  holdingRewardMinAmountOnWalletRequiredForWithdrawal: bigint;
  confirmCallback: () => void;
  successCallback: () => void;
  refetchUserSummary: (clearCurrentData: boolean) => Promise<UserNodesAccountSummaryDto | null>;
}

interface WithdrawNodesHoldingRewardsDialogContextProps {
  open: (openProps: WithdrawNodesHoldingRewardsDialogOpenProps) => void,
}

export const useWithdrawNodesHoldingRewardsDialog = (): WithdrawNodesHoldingRewardsDialogContextProps => {
  const web3Account = useAccount();
  const isCorrectChain = web3Account.chainId === wagmiConfig.chain.id;
  const isCorrectWalletConnected = web3Account.isConnected && isCorrectChain;

  const [userNodesSummary, setUserNodesSummary] = useState<UserNodesAccountSummaryDto | null>(null);
  const [isConvertingConvertableVestedTokens, setIsConvertingConvertableVestedTokens] = useState(false);

  const [openProps, setOpenProps] = useState<WithdrawNodesHoldingRewardsDialogOpenProps | null>(null);
  const {
    open: openGenericConfirmationDialog,
    set: updateGenericConfirmationDialog,
    isOpen: genericConfirmationDialogIsOpen
  } = useGenericConfirmationDialog();

  const [includeVested, setIncludeVested] = useState(false);

  const holdingRewardTokenUserWalletBalance = useReadContract({
    abi: erc20Abi,
    address: openProps?.holdingRewardTokenAddress as Address,
    chainId: wagmiConfig.chain.id,
    functionName: "balanceOf",
    args: [web3Account.address as Address],
    query: {
      enabled: genericConfirmationDialogIsOpen,
    }
  });

  const dialogConfig = useCallback((openProps: WithdrawNodesHoldingRewardsDialogOpenProps) => {
    let config: DialogConfig = {
      title: `Withdraw Holding Rewards`,
      content: <Spinner className="d-block m-auto"/>,
      buttons: [
        {
          kind: "confirm",
          title: "Claim",
          disabled: true
        }
      ],
      modalFooterProps:
        {
          className: "justify-content-center"
        }
    }

    if (!userNodesSummary) {
      return config;
    }

    const isMinUserWalletBalanceReached =
      holdingRewardTokenUserWalletBalance.data == null ||
      holdingRewardTokenUserWalletBalance.data >= openProps.holdingRewardMinAmountOnWalletRequiredForWithdrawal;

    const holdingRewardVestedTokenAmount = BigInt(userNodesSummary.totalHoldingRewardVestedTokenAmount);
    const holdingRewardConvertableVestedTokenAmount = BigInt(userNodesSummary.totalHoldingRewardConvertableVestedTokenAmount);
    const holdingRewardAvailableTokenAmount = BigInt(userNodesSummary.totalHoldingRewardAvailableTokenAmount);

    let withdrawalAmount = holdingRewardAvailableTokenAmount ?? 0n;
    let deductionAmount = holdingRewardAvailableTokenAmount ?? 0n;

    if (includeVested && openProps && holdingRewardVestedTokenAmount != null) {
      deductionAmount += holdingRewardVestedTokenAmount;
      withdrawalAmount +=
        holdingRewardVestedTokenAmount *
        BigInt(10000 - openProps.holdingRewardEarlyWithdrawalPenaltyBps) /
        10000n;
    }

    const isWithdrawableWithoutMinUserBalanceCheck = isCorrectWalletConnected && withdrawalAmount >= 100_000n;
    const isWithdrawable = isWithdrawableWithoutMinUserBalanceCheck && isMinUserWalletBalanceReached;

    const formattedVestedAmount =
      `${formatTokenAmountUI(holdingRewardVestedTokenAmount, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardVestedTokenName}`

    const formattedConvertableVestedAmount =
      `${formatTokenAmountUI(holdingRewardConvertableVestedTokenAmount, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardVestedTokenName}`

    const formattedAvailableAmount =
      `${formatTokenAmountUI(holdingRewardAvailableTokenAmount, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardTokenName}`;

    const formattedWithdrawalAmount =
      `${formatTokenAmountUI(withdrawalAmount, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardTokenName}`;

    const formattedDeductionAmount =
      includeVested ?
        `${formatTokenAmountUI(holdingRewardAvailableTokenAmount, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardTokenName} + 
          ${formatTokenAmountUI(holdingRewardVestedTokenAmount, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardVestedTokenName}` :
        `${formatTokenAmountUI(deductionAmount, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardTokenName}`;

    const formattedUserBalance =
      holdingRewardTokenUserWalletBalance.data != null ?
        `${formatTokenAmountUI(holdingRewardTokenUserWalletBalance.data, openProps.holdingRewardTokenDecimals)} ${commonTerms.holdingRewardTokenName}` :
        "...";

    const handleConfirm = async function (confirmCallback?: () => void, successCallback?: () => void) {
      try {
        confirmCallback?.();

        const address = web3Account.address;
        await clientApiServices.distribrainNodesApi.nodesControllerPostHoldingRewardsWithdraw({
          address: address!,
          includeVested: includeVested
        });
        toast.success(`Successfully withdrawn ${formattedWithdrawalAmount} to address ${address}!`);

        successCallback?.();
      } catch (err: any) {
        defaultErrorHandler(err, "Failed to withdraw holding reward: ");
        return false;
      }

      return true;
    };

    const handleConvertConvertableVestedTokens = async () => {
      setIsConvertingConvertableVestedTokens(true);
      try {
        //await new Promise(r => setTimeout(r, 5000));
        await clientApiServices.distribrainNodesApi.nodesControllerPostConvertHoldingRewardsWithFinishedVesting();
        setUserNodesSummary(await openProps.refetchUserSummary(false));
        toast.success(`Successfully converted ${commonTerms.holdingRewardVestedTokenName} to ${commonTerms.holdingRewardTokenName}!`);
      } catch (err: any) {
        defaultErrorHandler(err);
      } finally {
        setIsConvertingConvertableVestedTokens(false);
      }
    }

    const dialogContent = <>
      <Stack direction="vertical" gap={3}>
        <Stack className="">
          {isCorrectWalletConnected && <>
            <span style={{wordBreak: "break-all"}}>
              <span className="fw-bolder">Address: </span>{web3Account.address}
            </span>

              <span className="">
              <span className="fw-bolder">Wallet {commonTerms.holdingRewardTokenName} Balance: </span>{formattedUserBalance}
            </span>
          </>}
        </Stack>

        <Stack className="web3-connect-button-wrapper">
          <ConnectButton showBalance={false}/>
        </Stack>

        <Stack className="fs-5 mt-3">
          <span><span className="fw-bolder">{commonTerms.holdingRewardTokenName} Balance: </span>{formattedAvailableAmount}</span>
          <span><span className="fw-bolder">{commonTerms.holdingRewardVestedTokenName} Balance: </span>{formattedVestedAmount}</span>

          <span className="mt-3">
            <span className="fw-bolder">Convertable {commonTerms.holdingRewardVestedTokenName} Balance: </span>
            {formattedConvertableVestedAmount}
          </span>

          {holdingRewardConvertableVestedTokenAmount > 0 && <>
              <ButtonLoadable
                  variant="outline-secondary"
                  className="mb-2 d-flex align-items-center justify-content-center"
                  disabled={isConvertingConvertableVestedTokens}
                  loading={isConvertingConvertableVestedTokens}
                  onClick={() => handleConvertConvertableVestedTokens()}
              >
                  Convert to {commonTerms.holdingRewardTokenName}
              </ButtonLoadable>
          </>}

          <span className="mt-3"><span className="fw-bolder">You Claim: </span>{formattedDeductionAmount}</span>
          <span><span className="fw-bolder">You Receive: </span>{formattedWithdrawalAmount}</span>
        </Stack>

        {(!isWithdrawable && isWithdrawableWithoutMinUserBalanceCheck) && <>
            <Alert variant="warning">
                Minimum
                of {formatTokenAmountUI(openProps.holdingRewardMinAmountOnWalletRequiredForWithdrawal, openProps.holdingRewardTokenDecimals)} {commonTerms.holdingRewardTokenName}
                on the connected wallet is required for withdrawal. You can buy more {commonTerms.holdingRewardTokenName} on any supported exchange.
            </Alert>
        </>}

        <InputGroup>
          <Form.Check
            type="checkbox"
            checked={includeVested}
            onChange={e => setIncludeVested(e.target.checked)}
            label={<>
              Claim {commonTerms.holdingRewardVestedTokenName} ({uiPercentageNumberNiceFormat(openProps.holdingRewardEarlyWithdrawalPenaltyBps / 10000)} penalty)
            </>}
            className="pe-2 fs-5"
            id="holding-reward-withdraw-include-vested-check"
          />
        </InputGroup>
      </Stack>
    </>;

    config = {
      ...config,
      content: dialogContent,
      buttons: [
        {
          kind: "confirm",
          title: !isWithdrawable && isWithdrawableWithoutMinUserBalanceCheck ?
            `Insufficient ${commonTerms.holdingRewardTokenName} balance on wallet` :
            `Claim ${formattedWithdrawalAmount}`,
          disabled: !isWithdrawable,
          onClick: () => handleConfirm(openProps.confirmCallback, openProps.successCallback)
        }
      ],
    }

    return config;
  }, [holdingRewardTokenUserWalletBalance.data, includeVested, isConvertingConvertableVestedTokens, isCorrectWalletConnected, userNodesSummary, web3Account.address]);

  useEffect(() => {
    if (!openProps)
      return;

    updateGenericConfirmationDialog(dialogConfig(openProps));
  }, [dialogConfig, openProps, updateGenericConfirmationDialog, web3Account.address, web3Account.chainId]);

  return {
    open: (openProps: WithdrawNodesHoldingRewardsDialogOpenProps) => {
      setOpenProps(openProps);
      setUserNodesSummary(null);
      openGenericConfirmationDialog(dialogConfig(openProps));

      openProps.refetchUserSummary(false).then((newSummary) => {
        setUserNodesSummary(newSummary)
      });
    }
  }
}
