import { useRouter } from "next/router";
import React, { useState } from "react";
import { Card, Stack } from "react-bootstrap";
import ButtonLoadable from "@/components/shared/ButtonLoadable";
import { routes } from "@/data/routes";
import { useUser } from "@/hooks/useUser";

interface AuthFormProps {
  loading: boolean,
  onSubmitHandler: (callback: () => Promise<void>) => Promise<void>,
}

const LoginForm = ({loading, onSubmitHandler}: AuthFormProps) => {
  const router = useRouter();
  const user = useUser();

  const onSignInClick = async () => {
    await onSubmitHandler(async () => {
      await router.push(routes.auth.login("/"));
    })
  }

  return <>
    <Card.Title className="text-center">Engines Portal Login</Card.Title>

    <Stack gap={3}>
      <ButtonLoadable
        type="submit"
        className="mt-2 w-100 py-3 lead d-flex align-items-center justify-content-center"
        loading={loading || user.user != null}
        disabled={loading || user.user != null}
        onClick={() => onSignInClick()}
      >
        Sign In / Register
      </ButtonLoadable>

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
  </>
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