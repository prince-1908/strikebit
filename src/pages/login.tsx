import { Card, Container, Stack } from "react-bootstrap";
import { NextPage } from "next";
import React from "react";
import Logo from "../assets/images/Logo.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useAsyncEffect from "use-async-effect";
import { AuthCardBody } from "@/components/auth/AuthCardBody";
import { useUser } from "@/hooks/useUser";

const LoginPage: NextPage = (props) => {
  const router = useRouter();
  const user = useUser();

  useAsyncEffect(async _ => {
    if (user.user) {
      toast.info("Already logged in, redirecting...");
      await router.push("/");
    }
  }, [user.user])

  return (
    <>
      <Container
        className="d-flex my-4 vstack justify-content-center gap-3"
        style={{
          maxWidth: "400px"
        }}
      >
        <Card border={"primary"} bg={"dark"}>
          <Card.Body>
            <Stack>
              <Image
                src={Logo}
                alt="DistriBrain"
                priority={true}
                className="w-100 h-auto px-3 mb-3"
              />

              <AuthCardBody/>
            </Stack>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}


export default LoginPage;