"use client";
import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import UpdateToken from "@/lib/fetch/tokens/update";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function EditTokenModal({
  token,
  disclosure,
}: {
  token: any;
  disclosure: UseOverlayStateReturn;
}) {
  const { refreshProjectTokens } = useRefreshCache();
  // create modal
  const { isOpen, setOpen: onOpenChange, close: onClose } = disclosure;
  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = (await UpdateToken(
      token.id,
      data.description.toString(),
    )) as any;
    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to update token");
      setApiErrorMessage("Failed to update token");
      toast.danger("Token", { description: "Failed to update token" });
      return;
    }
    if (res.success) {
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      refreshProjectTokens(token.project_id);
      onOpenChange(false);
    } else {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      toast.danger("Token", { description: "Failed to update token" });
    }
    setIsLoading(false);
  };
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center">
            <Modal.Dialog className="w-full">
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold">Edit Token</p>
                        <p className="text-sm text-muted">
                          Edit the token details below and click apply changes
                          to save.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {apiError && (
                      <ErrorCard
                        error={apiErrorText}
                        message={apiErrorMessage}
                      />
                    )}
                    <Form
                      className="w-full items-stretch"
                      validationErrors={errors}
                      onSubmit={onSubmit}
                    >
                      <div className="flex flex-col gap-4">
                        <TextField
                          isRequired
                          defaultValue={token.description}
                          name="description"
                        >
                          <Label>{"Description"}</Label>
                          <InputGroup>
                            <Input
                              placeholder="Enter the flow description"
                              type="description"
                            />
                          </InputGroup>
                        </TextField>
                      </div>

                      <div className="flex flex-cols gap-2 mt-4 mb-2 items-center justify-end">
                        <Button type="reset" variant="ghost" onPress={onClose}>
                          {<Icon icon="hugeicons:cancel-01" width={18} />}
                          Cancel
                        </Button>
                        <Button isPending={isLoading} type="submit">
                          {<Icon icon="hugeicons:floppy-disk" width={18} />}
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  </Modal.Body>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
