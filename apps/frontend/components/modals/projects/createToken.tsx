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
import ErrorCard from "@/components/error/ErrorCard";
import CreateProjectToken from "@/lib/fetch/project/POST/CreateProjectToken";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function CreateProjectTokenModal({
  disclosure,
  projectID,
}: {
  disclosure: UseOverlayStateReturn;
  projectID: any;
}) {
  const { refreshProjectTokens } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = (await CreateProjectToken(
      projectID,
      data.expiresIn,
      data.description.toString(),
    )) as any;
    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to create token");
      setApiErrorMessage("Failed to create token");
      toast.danger("Project", { description: "Failed to create token" });
      return;
    }
    if (res.success) {
      refreshProjectTokens(projectID);
      onOpenChange(false);
      toast.success("Project", { description: "Token created successfully" });
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      toast.danger("Project", { description: "Failed to create token" });
    }
    setIsLoading(false);
  };
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">
                          Create Project Token
                        </p>
                        <p className="text-sm text-muted">
                          Create a new token for your project.
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
                        <TextField name="description">
                          <Label>{"Description"}</Label>
                          <InputGroup>
                            <Input placeholder="Enter the key description" />
                          </InputGroup>
                        </TextField>
                        <TextField defaultValue="7" name="expiresIn">
                          <Label>{"Expires In"}</Label>
                          <InputGroup>
                            <Input
                              placeholder="Enter the token expiration time"
                              type="number"
                            />
                            <InputGroup.Suffix>{"days"}</InputGroup.Suffix>
                          </InputGroup>
                        </TextField>
                      </div>

                      <div className="flex flex-cols gap-2 mt-4 mb-2 items-center justify-end">
                        <Button type="reset" variant="ghost" onPress={onClose}>
                          {<Icon icon="hugeicons:cancel-01" width={18} />}
                          Cancel
                        </Button>
                        <Button
                          isPending={isLoading}
                          type="submit"
                          variant="primary"
                        >
                          {<Icon icon="hugeicons:plus-sign" width={18} />}
                          Create
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
