import React, { createContext, ReactNode, useState } from "react";
import { ButtonProps, Modal, ModalFooterProps, ModalProps } from "react-bootstrap";
import ButtonLoadable from "@/components/shared/ButtonLoadable";
import { StarIcon } from "@/components/visual/StarIcon";

export interface DialogButtonProps extends ButtonProps {
  kind: "confirm" | "dismiss" | "generic";
  title: string;
  disabled?: boolean;
  onClick?: (() => boolean) | (() => Promise<boolean>);
  preventCloseOnClick?: boolean;
}

export interface DialogConfig {
  title?: string;
  content?: ReactNode | (() => ReactNode);
  buttons: DialogButtonProps[];
  modalProps?: Omit<ModalProps, "open">;
  modalFooterProps?: ModalFooterProps;
}

export interface GenericConfirmationDialogContextProps {
  set: (props: DialogConfig) => void;
  open: (openProps: DialogConfig) => void;
  isOpen: boolean;
}

const GenericConfirmationDialogContext = createContext<GenericConfirmationDialogContextProps>(
  {} as GenericConfirmationDialogContextProps
)

export const GenericConfirmationDialogProvider = ({children}: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const [awaitingButtons, setAwaitingButtons] = useState(new Set<number>());

  const openDialog = (config: DialogConfig) => {
    setConfig(config);
    setIsOpen(true);
  };

  const closeDialog = () => {
    //setConfig(null);
    setIsOpen(false);
  }

  const executeButtonClick = async (button: DialogButtonProps, buttonIndex: number) => {
    let clickResult = null;
    if (button.onClick) {
      clickResult = button.onClick();
    }

    let mustCloseDialog = !button.preventCloseOnClick;
    if (clickResult) {
      setAwaitingButtons(new Set(awaitingButtons.add(buttonIndex)));
      try {
        mustCloseDialog = mustCloseDialog && await clickResult;
      } finally {
        awaitingButtons.delete(buttonIndex);
        setAwaitingButtons(new Set(awaitingButtons));
      }
    }

    if (mustCloseDialog) {
      closeDialog();
    }
  }

  const handleDialogClose = async () => {
    const isBusy = awaitingButtons.size != 0;
    if (isBusy)
      return;

    const dismissButtonIndex = config!.buttons.findIndex(b => b.kind == "dismiss");
    if (dismissButtonIndex === -1) {
      closeDialog();
      return;
    }

    await executeButtonClick(config!.buttons[dismissButtonIndex], dismissButtonIndex);
  }

  const isBusy = awaitingButtons.size != 0;

  return (
    <GenericConfirmationDialogContext.Provider value={{
      open: openDialog,
      set: setConfig,
      isOpen: isOpen
    }}>
      {children}

      {config && <>
          <Modal
              show={isOpen}
              onHide={handleDialogClose}
              backdrop={isBusy ? "static" : true}
              centered
              data-rk=""
              {...config.modalProps}
          >
              <Modal.Header closeButton>
                  <Modal.Title><StarIcon className="me-2"/>{config.title}</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                {config.content instanceof Function ? config.content() : config.content}
              </Modal.Body>

              <Modal.Footer {...config.modalFooterProps}>
                {config.buttons.map((button, index) => {
                  const {title, preventCloseOnClick, onClick, kind, ...restButton} = button;
                  const buttonDisabled = isBusy || button.disabled;

                  return <ButtonLoadable
                    key={`dialogButton_${index}`}
                    onClick={async () => {
                      if (!buttonDisabled) {
                        await executeButtonClick(button, index)
                      }
                    }}
                    variant="outline-primary"
                    loading={awaitingButtons.has(index)}
                    autoFocus={button.kind == "confirm"}
                    {...restButton}
                    className={`d-flex align-items-center p-2 px-3 fs-4`}
                    disabled={buttonDisabled}
                  >
                    {button.title}
                  </ButtonLoadable>
                })}
              </Modal.Footer>
          </Modal>
      </>}
    </GenericConfirmationDialogContext.Provider>
  );
};

export const useGenericConfirmationDialog = () => {
  const context = React.useContext(GenericConfirmationDialogContext)

  return context
}
