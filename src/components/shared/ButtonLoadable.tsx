import React, { FC, ReactNode } from "react";
import { Button, ButtonProps, Spinner } from "react-bootstrap";

interface ButtonLoadableProps extends ButtonProps {
  children: ReactNode;
  loading: boolean;
  loadingChildren?: ReactNode;
}

export const ButtonLoadable: FC<ButtonLoadableProps> = ({children, loading, loadingChildren, ...props}) => {
  return (
    <Button {...props}>
      {loading && (
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
      )}

      <span>
        {!loading && children}

        {loading && (loadingChildren ?? children)}
      </span>
    </Button>
  );
};

export default ButtonLoadable;
