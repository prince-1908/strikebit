import React, { useCallback, useEffect, useState } from "react";
import { NodesReferralPurchaseDto, UserNodesReferralPurchasesDto } from "@/generated/distribrain-nodes-api";
import clientApiServices from "@/services/clientApiServices";
import { Alert, Button, Card, Spinner, Stack } from "react-bootstrap";
import { defaultErrorHandler } from "@/utils/defaultErrorHandler";
import { uiDateNiceFormat, uiIntNumberNiceFormat } from "@/utils/uiNiceFormat";
import { useRouter } from "next/router";
import { routes } from "@/data/routes";
import { formatTokenAmountUI } from "@/utils/formatTokenAmountUI";
import { FaExternalLinkAlt } from "react-icons/fa";
import { DialogConfig, useGenericConfirmationDialog } from "@/components/dialogs/GenericConfirmationDialog";

interface NodesReferralPurchasesHistoryDialogProps {
  referralRewardTokenDecimals: number;
}

interface NodesReferralPurchasesHistoryDialogContextProps {
  open: (openProps: NodesReferralPurchasesHistoryDialogProps) => void
}

const ReferralPurchaseCard = (
  {
    purchase,
    referralRewardTokenDecimals
  }: {
    purchase: NodesReferralPurchaseDto,
    referralRewardTokenDecimals: number
  }
) => {
  const router = useRouter();

  return <>
    <Card
      bg="dark"
      border="dark"
    >
      <Card.Body className="lh-base">
        <Stack gap={2} className="fs-5">
          <span className="mb-2 fw-bold">{uiDateNiceFormat(purchase.createdAt, router.locale)}</span>
          <span className="fs-5">
            <span className="fw-bolder">User Address: </span>
            {!purchase.buyerAddress && <>N/A</>}

            <span className="fs-5">
              {purchase.buyerAddress && <a
                  href={routes.evmBlockExplorer.address(purchase.buyerAddress)}
                  target="_blank"
                  rel="noreferrer"
              >{purchase.buyerAddress}&nbsp;&nbsp;<FaExternalLinkAlt/></a>}
            </span>
          </span>
          <span><span className="fw-bolder">Engines Purchased: </span>{uiIntNumberNiceFormat(purchase.amount)}</span>

          <span className="mb-2">
            <span className="fw-bolder">Your Reward: </span>
            {formatTokenAmountUI(purchase.rewardEarnedTokenAmount, referralRewardTokenDecimals)} USDT
          </span>

          <Button
            href={routes.evmBlockExplorer.transaction(purchase.transactionHash)}
            variant="primary"
            className="fs-5"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Purchase Transaction&nbsp;&nbsp;<FaExternalLinkAlt/>
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  </>
};

export const useNodesReferralPurchasesHistoryDialog = (): NodesReferralPurchasesHistoryDialogContextProps => {
  const [openProps, setOpenProps] = useState<NodesReferralPurchasesHistoryDialogProps>({} as any);
  const {open: openGenericConfirmationDialog, set: updateGenericConfirmationDialog} = useGenericConfirmationDialog();
  const [myReferralPurchases, setMyReferralPurchases] = useState<UserNodesReferralPurchasesDto | null>(null);

  const fetchData = async () => {
    setMyReferralPurchases(null);
    try {
      setMyReferralPurchases((await clientApiServices.distribrainNodesApi.nodesControllerGetReferralPurchases()).data);
    } catch (err: any) {
      defaultErrorHandler(err);
    }
  }

  const dialogConfig = useCallback((openProps: NodesReferralPurchasesHistoryDialogProps) => {
    const dialogContent = <>
      {!myReferralPurchases && <Spinner className="d-block m-auto"/>}

      {myReferralPurchases && <>
        {myReferralPurchases.purchases.length == 0 && <>
            <Alert variant="info">No referral purchases yet.</Alert>
        </>}

          <Stack gap={3}>
            {myReferralPurchases.purchases.map(purchase => (
              <ReferralPurchaseCard
                key={`refpurchase-${purchase.transactionHash}`}
                purchase={purchase}
                referralRewardTokenDecimals={openProps.referralRewardTokenDecimals}
              />
            ))}
          </Stack>
      </>}
    </>;

    const config: DialogConfig = {
      title: `Referral Rewards History`,
      content: dialogContent,
      buttons: [
        {
          kind: "dismiss",
          title: "Close",
        }
      ],
      modalProps: {
        size: "lg"
      }
    }

    return config;
  }, [myReferralPurchases])

  useEffect(() => {
    updateGenericConfirmationDialog(dialogConfig(openProps));
  }, [openProps, myReferralPurchases, updateGenericConfirmationDialog, dialogConfig]);

  return {
    open: (openProps: NodesReferralPurchasesHistoryDialogProps) => {
      setOpenProps(openProps);
      openGenericConfirmationDialog(dialogConfig(openProps));

      fetchData().then(r => {
      });
    }
  }
}
