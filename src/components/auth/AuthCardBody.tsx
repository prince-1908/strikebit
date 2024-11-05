import { useRouter } from "next/router";
import React, { useState } from "react";
import { Card, Stack } from "react-bootstrap";
import ButtonLoadable from "@/components/shared/ButtonLoadable";
import { Spinner } from "react-bootstrap";
import { routes } from "@/data/routes";
import { useUser } from "@/hooks/useUser";

interface AuthFormProps {
  loading: boolean,
  onSubmitHandler: (callback: () => Promise<void>) => Promise<void>,
}

const LoginForm = ({ loading, onSubmitHandler }: AuthFormProps) => {
  const router = useRouter();
  const user = useUser();

  const onSignInClick = async () => {
    await onSubmitHandler(async () => {
      await router.push(routes.auth.login("/"));
    })
  }

  return <div
    className="d-flex"
    style={{
      flexDirection: "column",
      gap: "1rem"
    }}
  >
    <Card.Title className="text-center">Radiant Portal Log In</Card.Title>

    <Stack gap={3}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {/* <ButtonLoadable
        type="submit"
        className="mt-2 w-100 py-3 lead d-flex align-items-center justify-content-center"
        loading={loading || user.user != null}
        disabled={loading || user.user != null}
        onClick={() => onSignInClick()}
      >
        Sign In / Register
      </ButtonLoadable> */}

      {loading || user.user != null ? <div className="white-btn"
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Spinner
          style={{
            marginTop: 0,
            marginRight: "0.75rem",
            // @ts-ignore
            "--bs-spinner-width": "1.2rem",
            "--bs-spinner-height": "1.2rem",
            "--bs-spinner-border-width": "0.2rem",
          }}
        />
      </div> :

        <div className="d-flex justify-content-evenly" style={{
          width: "100%"
        }}>
          <button
            type="submit"
            className="white-btn"
            style={{
              cursor: "pointer"
            }}
            disabled={loading || user.user != null}
            onClick={() => onSignInClick()}
          >
            Sign In
          </button>
          <button
            type="submit"
            className="white-btn"
            style={{
              cursor: "pointer"
            }}
            disabled={loading || user.user != null}
            onClick={() => onSignInClick()}
          >
            Register
          </button>
        </div>}

      {/*      <Stack gap={3} className="flex-grow-0 font-weight-light text-uppercase align-items-center">
        <Button
          variant=""
          className="p-0 btn-link d-block fw-bold text-muted text-end"
          //onClick={() => setCardState(AuthCardState.Registration)}
        >
          Create an account
        </Button>
      </Stack>*/}
    </Stack>
  </div>
}

export const AuthCardBody = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (callback: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await callback();
    } finally {
      setIsLoading(false);
    }
  }

  return <>
    <LoginForm
      loading={isLoading}
      onSubmitHandler={handleSubmit}
    />
  </>
}