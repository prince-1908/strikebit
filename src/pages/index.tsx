import { Badge, Button, Card, Col, Container, Row, Spinner, Stack } from "react-bootstrap";
import { NextPage } from "next";
import React, { useState } from "react";
import Logo from "../assets/images/Logo.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import useAsyncEffect from "use-async-effect";
import { MdLink, MdOutlineContentCopy, MdOutlineHistory } from "react-icons/md";
import { BiMoneyWithdraw } from "react-icons/bi";
import { TbLink, TbShare2 } from "react-icons/tb";
import { basicRemoteDataFetcherFn } from "@/utils/basicRemoteDataFetcher";
import clientApiServices from "@/services/clientApiServices";
import {
  NodesInformationDto,
  UserMyReferralCodeResponseDto,
  UserNodesAccountSummaryDto
} from "@/generated/distribrain-nodes-api";
import { formatTokenAmountUI } from "@/utils/formatTokenAmountUI";
import { uiIntNumberNiceFormat, uiPercentageNumberNiceFormat } from "@/utils/uiNiceFormat";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import noCacheHeaders from "@/utils/noCacheHeaders";
import { StarIcon } from "@/components/visual/StarIcon";
import { PurchaseNodesDialog } from "@/components/dialogs/PurchaseNodesDialog/PurchaseNodesDialog";
import { routes } from "@/data/routes";
import { defaultErrorHandler } from "@/utils/defaultErrorHandler";
import { useNodesReferralPurchasesHistoryDialog } from "@/hooks/dialogs/useNodesReferralPurchasesHistoryDialog";
import { useWithdrawNodesReferralRewardsDialog } from "@/hooks/dialogs/useWithdrawNodesReferralRewardsDialog";
import { useWithdrawNodesHoldingRewardsDialog } from "@/hooks/dialogs/useWithdrawNodesHoldingRewardsDialog";
import commonTerms from "@/data/commonTerms";
import { useUser } from "@/hooks/useUser";
import { FiLogOut } from "react-icons/fi";
import useReferralCodeFromQuery from "@/hooks/useReferralCodeFromQuery";
import { pow } from "@/utils/bigint/bigIntMath";

const HomePageBody = (
  {
    referralCode,
    userNodesSummary,
    nodesInformation,
    refetchData,
    onViewReferralPurchasesHistoryClicked,
    onWithdrawReferralRewardsClicked,
    onWithdrawHoldingRewardsClicked,
  }: {
    referralCode: UserMyReferralCodeResponseDto;
    userNodesSummary: UserNodesAccountSummaryDto;
    nodesInformation: NodesInformationDto;
    refetchData: () => void;
    onViewReferralPurchasesHistoryClicked: () => void;
    onWithdrawReferralRewardsClicked: () => void;
    onWithdrawHoldingRewardsClicked: () => void;
  }
) => {
  const router = useRouter();
  const user = useUser();
  const referralCodeFromQuery = useReferralCodeFromQuery();
  const [showPurchaseDialog, setShowNodePurchaseDialog] = useState(false);

  const canWithdrawHoldingRewards =
    BigInt(userNodesSummary.totalHoldingRewardBalanceTokenAmount) > 0;

  const formatHoldingTokenAmount = (amount: bigint) =>
    formatTokenAmountUI(amount, nodesInformation?.holdingRewardErc20Token?.decimals ?? 0);

  const formatReferralTokenAmount = (amount: bigint) =>
    formatTokenAmountUI(amount, nodesInformation?.referralRewardErc20Token?.decimals ?? 0);

  const formatDePinKeyPurchaseRewardTokenAmount = (amount: bigint) =>
    formatTokenAmountUI(BigInt(userNodesSummary.totalDePinKeyCount) * 100_000n * pow(10n, 6), 6);

  const onNodePurchased = async () => {
    setShowNodePurchaseDialog(false);
    refetchData();
  }

  const onLogoutClicked = async () => {
    toast.info("Signing out...");
    await router.push(routes.auth.logout());
  }

  return <>
    <Container
      className="d-flex w-auto mb-2 flex-column flex-sm-row align-items-center gap-3"
      style={{
        minHeight: "2.9rem"
      }}
    >
      <span
        className="d-flex h-100 px-3 py-2 align-items-center border-2 border- border-info rounded-pill"
        style={{
          border: "solid"
        }}
      >
        {user.user!.picture && (
          <Image
            src={user.user!.picture!}
            alt="Avatar"
            width={100}
            height={100}
            unoptimized
            className="rounded-circle"
            style={{
              width: "2rem",
              height: "2rem",
              marginLeft: "-0.5rem",
              marginRight: "0.5rem",
            }}
          />
        )}

        {user.user!.userDisplayName}
      </span>

      <Button
        variant="outline-info"
        className="d-flex h-100 px-3 py-2 align-items-center rounded-pill no-primary-gradient"
        onClick={() => onLogoutClicked()}
      >
        <span className="d-flex fs-4 me-2"><FiLogOut/></span> Sign Out
      </Button>
    </Container>

    <Container className="h1 p-0 text-center">
      Total <Badge bg="primary" pill>
      {uiIntNumberNiceFormat(nodesInformation.purchaseInfo.globalPurchasedNodesCount)}
    </Badge> DistriBrain Engines Sold
    </Container>

    <Container className="h1 p-0 text-center">
      Total <Badge bg="primary" pill>
      {uiIntNumberNiceFormat(nodesInformation.purchaseInfo.globalPurchasedDePinKeysCount)}
    </Badge> DePIN Keys Sold
    </Container>

    <Container className="h1 m-0 text-center position-relative">
      <div className="animated-edge-button-wrapper">
        <Button
          variant="primary"
          className="p-3 px-lg-4 fs-3 fw-medium flex-fill flex-lg-grow-0 animated-edge-button btn-primary-gradient"
          onClick={() => setShowNodePurchaseDialog(true)}
          disabled={nodesInformation.featureFlags.purchasingDisabled}
        >
          {nodesInformation.featureFlags.purchasingDisabled && <>Temporarily Unavailable</>}

          {!nodesInformation.featureFlags.purchasingDisabled && <>Buy DistriBrain Engines</>}
        </Button>
      </div>
    </Container>

    <Container className="mb-1 h2 text-center">
      <StarIcon/><span className="mx-3">My Referral Code</span><StarIcon/>
    </Container>

    <Row>
      <Col>
        <Card
          className="bg-blur-primary"
          border="primary"
        >
          <Card.Body>
            <Row>
              <Col
                xs={12}
                md={6}
                className="d-flex m-0 align-items-center justify-content-start h3"
              >
                {referralCode.code}

                <CopyToClipboard
                  text={referralCode.code}
                  onCopy={() => toast.info("Referral code copied!", {autoClose: 1500})}
                >
                  <Button variant="primary ms-3" title="Copy referral code">
                    <MdOutlineContentCopy/>
                  </Button>
                </CopyToClipboard>

                <CopyToClipboard
                  text={routes.referralLink(referralCode.code)}
                  onCopy={() => toast.info("Referral link copied!", {autoClose: 1500})}
                >
                  <Button variant="primary ms-2" title="Copy referral link">
                    <TbLink/>
                  </Button>
                </CopyToClipboard>
              </Col>

              <Col
                xs={12}
                md={6}
                className="d-flex m-0 mt-3 mt-md-0 align-items-center justify-content-start justify-content-md-end h6"
              >
                Share your referral code and start earning USDT rewards, 5% from each sale.
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <Container className="mt-2 mb-1 h2 text-center">
      <StarIcon/><span className="mx-3">My Engines</span><StarIcon/>
    </Container>

    <Row>
      <Col>
        <Card
          className="bg-blur-primary"
          border="primary"
        >
          <Card.Body>
            <Row>
              <Col xs={12} md={6}>
                <Stack gap={3}>
                  <div>
                    <Card.Title>DistriBrain Engines</Card.Title>
                    <div>
                      <span className="card-subtitle h3">
                        {userNodesSummary.totalPurchasedNodesCount}
                      </span>
                      <span className="card-subtitle h4"> holding</span>
                    </div>
                  </div>

                  <div>
                    <Card.Title>DePIN Keys</Card.Title>
                    <div>
                      <span className="card-subtitle h3">
                        {userNodesSummary.totalDePinKeyCount}
                      </span>
                      <span className="card-subtitle h4"> granted</span>
                    </div>
                  </div>
                </Stack>
              </Col>

              <Col xs={12}
                   md={6}
                   className="d-flex flex-column justify-content-evenly m-0 mt-3 mt-md-0 h6"
              >
                <p>
                  For every 5 purchased Engines, you are granted a <a
                  href={routes.docs.dePinKey()}
                  target="_blank"
                  rel="noreferrer"
                >
                  DePIN Key
                </a>!
                </p>

                <p className="mb-0">Each Engine and each DePIN Key generate
                  more {commonTerms.holdingRewardVestedTokenName} for you, every day at midnight
                  00:00 UTC.</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <Container className="mt-2 mb-1 h2 text-center">
      <StarIcon/><span className="mx-3">My Balance</span><StarIcon/>
    </Container>

    <Card
      className="row g-0 flex-row bg-blur-primary"
      border="primary"
      style={{
        paddingBottom: "var(--bs-gutter-y)"
      }}
    >
      <Col xs={12} md={6}>
        <Card className="h-100 border-0 g-0">
          <Card.Body className="d-flex vstack gap-3 justify-content-between">
            <Stack gap={3}>
              <div>
                <Card.Title>{commonTerms.holdingRewardVestedTokenName} Rewards</Card.Title>
                <div>
                  <span className="card-subtitle h3">
                    {formatHoldingTokenAmount(BigInt(userNodesSummary.totalHoldingRewardVestedTokenAmount))}
                  </span>
                  <span className="card-subtitle h4"> {commonTerms.holdingRewardVestedTokenName}</span>
                </div>
              </div>

              <div>
                <Card.Title>{commonTerms.holdingRewardTokenName} Rewards</Card.Title>
                <div>
                  <span className="card-subtitle h3">
                    {formatHoldingTokenAmount(BigInt(userNodesSummary.totalHoldingRewardAvailableTokenAmount))}
                  </span>
                  <span className="card-subtitle h4"> {commonTerms.holdingRewardTokenName}</span>
                </div>
              </div>

              <div>
                <Card.Title>{commonTerms.dePinKeyPurchaseRewardTokenName} Rewards</Card.Title>
                <div>
                  <span className="card-subtitle h3">
                    {formatDePinKeyPurchaseRewardTokenAmount(BigInt(userNodesSummary.totalDePinKeyPurchaseRewardAvailableTokenAmount))}
                  </span>
                  <span className="card-subtitle h4"> {commonTerms.dePinKeyPurchaseRewardTokenName}</span>
                </div>
              </div>
            </Stack>

            {!nodesInformation.featureFlags.holdingRewardsWithdrawDisabled && <>
                <Button
                    variant="primary p-3 px-4 fs-5"
                    disabled={!canWithdrawHoldingRewards}
                    onClick={() => onWithdrawHoldingRewardsClicked()}
                >
                    <TbShare2 className="me-2"/> Claim {commonTerms.holdingRewardTokenName}
                </Button>
            </>}
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={6}>
        <Card className="h-100 border-0 g-0">
          <Card.Body>
            <Card.Title>USDT Rewards</Card.Title>
            <Stack gap={3}>
              <div className="mb-md-3">
                <span
                  className="card-subtitle h3">{formatReferralTokenAmount(BigInt(userNodesSummary?.totalReferralRewardAvailableTokenAmount))}</span>
                <span className="card-subtitle h4"> USDT</span>
              </div>

              {!nodesInformation.featureFlags.referralRewardsWithdrawDisabled && <>
                  <Button
                      variant="primary p-3 px-4 fs-5"
                      disabled={BigInt(userNodesSummary.totalReferralRewardAvailableTokenAmount) <= 0}
                      onClick={() => onWithdrawReferralRewardsClicked()}
                  >
                      <BiMoneyWithdraw className="me-2"/> Withdraw
                  </Button>
              </>}

              <Button
                variant="primary p-3 px-4 fs-5"
                onClick={() => onViewReferralPurchasesHistoryClicked()}
              >
                <MdOutlineHistory className="me-2"/> Reward History
              </Button>
            </Stack>
          </Card.Body>
        </Card>
      </Col>
    </Card>

    <PurchaseNodesDialog
      referralCodeRequired={nodesInformation.featureFlags.purchasingReferralCodeRequired}
      pricePerNode={BigInt(nodesInformation.purchaseInfo.currentPricePerNode)}
      currentNodeLimit={nodesInformation.purchaseInfo.limitAtPrice}
      globalTotalPurchasedNodes={nodesInformation.purchaseInfo.globalPurchasedNodesCount}
      purchaseTokenAddress={nodesInformation.purchaseInfo.erc20Token.address}
      purchaseTokenDecimals={nodesInformation.purchaseInfo.erc20Token.decimals}
      isOpen={showPurchaseDialog}
      onClose={() => setShowNodePurchaseDialog(false)}
      purchasedCallback={() => onNodePurchased()}
    />
  </>
}

const HomePage: NextPage = () => {
  const router = useRouter();
  const user = useUser();

  const [referralCode, setReferralCode] = useState<UserMyReferralCodeResponseDto | null>(null);
  const [userNodesSummary, setUserNodesSummary] = useState<UserNodesAccountSummaryDto | null>(null);
  const [nodesInformation, setNodesInformation] = useState<NodesInformationDto | null>(null);

  const fetchData = async () => {
    console.log("Fetching data");

    const options = {
      headers: noCacheHeaders
    };
    const myReferralCodePromise = remoteData.getMyReferralCode(clientApiServices, null, null, options);
    const myNodesSummaryPromise = remoteData.getMyNodesSummary(clientApiServices, null, null, options);
    const nodesInformationPromise = remoteData.getNodesInformation(clientApiServices, null, null, options);

    setReferralCode(await myReferralCodePromise);
    setUserNodesSummary(await myNodesSummaryPromise);
    setNodesInformation(await nodesInformationPromise);
  }

  const fetchUserSummaryData = async (clearCurrentData: boolean) => {
    console.log("Fetching user summary data");

    if (clearCurrentData) {
      setUserNodesSummary(null);
    }
    try {
      const options = {
        headers: noCacheHeaders
      };
      const data = (await clientApiServices.distribrainNodesApi.nodesControllerGetUserSummary(options)).data;
      setUserNodesSummary(data);
      return data;
    } catch (err: any) {
      defaultErrorHandler(err);
      return null;
    }
  }

  useAsyncEffect(async _ => {
    if (!user.initialized)
      return;

    if (!user.user) {
      await router.push(routes.login());
      return;
    }

    await fetchData();
  }, [user]);

  const referralPurchasesHistoryDialog = useNodesReferralPurchasesHistoryDialog();
  const withdrawReferralRewardsDialog = useWithdrawNodesReferralRewardsDialog();
  const withdrawHoldingRewardsDialog = useWithdrawNodesHoldingRewardsDialog();

  const showReferralPurchasesHistoryDialog = () => {
    referralPurchasesHistoryDialog.open({
      referralRewardTokenDecimals: nodesInformation!.holdingRewardErc20Token?.decimals ?? 0
    });
  }

  const showWithdrawReferralRewardsDialog = () => {
    withdrawReferralRewardsDialog.open({
      userNodesSummary: userNodesSummary,
      referralRewardTokenDecimals: nodesInformation!.holdingRewardErc20Token?.decimals ?? 0,
      confirmCallback: () => {
      },
      successCallback: async () => await fetchData(),
      refetchUserSummary: fetchUserSummaryData,
    })
  }

  const showWithdrawHoldingRewardsDialog = () => {
    withdrawHoldingRewardsDialog.open({
      userNodesSummary: userNodesSummary,
      holdingRewardTokenAddress: nodesInformation!.holdingRewardErc20Token?.address,
      holdingRewardTokenDecimals: nodesInformation!.holdingRewardErc20Token?.decimals ?? 0,
      holdingRewardEarlyWithdrawalPenaltyBps: nodesInformation!.holdingRewardEarlyWithdrawalPenaltyBps,
      holdingRewardMinAmountOnWalletRequiredForWithdrawal: BigInt(nodesInformation!.holdingRewardMinAmountOnWalletRequiredForWithdrawal),
      confirmCallback: () => {
      },
      successCallback: async () => await fetchData(),
      refetchUserSummary: fetchUserSummaryData,
    });
  }

  const loaded = user.user && referralCode != null && userNodesSummary != null && nodesInformation != null;

  return (
    <>
      <Container
        className="d-flex position-relative mt-4 vstack justify-content-center gap-3"
        style={{
          maxWidth: "735px",
        }}
      >
        <Image
          src={Logo}
          alt="DistriBrain"
          priority={true}
          className="w-100 h-auto px-3 mb-3"
          style={{
            maxHeight: "80px"
          }}
        />

        {!loaded && <>
            <Spinner style={{
              alignSelf: "center",
              // @ts-ignore
              "--bs-spinner-width": "5rem",
              "--bs-spinner-height": "5rem"
            }}/>
        </>}

        {loaded && <>
            <HomePageBody
                nodesInformation={nodesInformation}
                userNodesSummary={userNodesSummary}
                referralCode={referralCode}
                refetchData={() => fetchData()}
                onViewReferralPurchasesHistoryClicked={() => showReferralPurchasesHistoryDialog()}
                onWithdrawReferralRewardsClicked={() => showWithdrawReferralRewardsDialog()}
                onWithdrawHoldingRewardsClicked={() => showWithdrawHoldingRewardsDialog()}
            />
        </>}
      </Container>
    </>
  );
}

const remoteData = {
  getMyReferralCode: basicRemoteDataFetcherFn(
    (apiServices, options) => apiServices.distribrainNodesUsersApi.usersControllerGetMyReferralCode(options)
  ),
  getNodesInformation: basicRemoteDataFetcherFn(
    (apiServices, options) => apiServices.distribrainNodesApi.nodesControllerGetInformation(options)
  ),
  getMyNodesSummary: basicRemoteDataFetcherFn(
    (apiServices, options) => apiServices.distribrainNodesApi.nodesControllerGetUserSummary(options)
  ),
  getMyReferralPurchases: basicRemoteDataFetcherFn(
    (apiServices, options) => apiServices.distribrainNodesApi.nodesControllerGetReferralPurchases(options)
  ),
}

export default HomePage;