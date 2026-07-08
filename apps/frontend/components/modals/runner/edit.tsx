"use client";
import {
  Button,
  Description,
  FieldError,
  Form,
  InputGroup,
  Label,
  Modal,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import EditRunner from "@/lib/fetch/runner/PUT/Edit";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function EditRunnerModal({
  disclosure,
  runner,
}: {
  disclosure: UseOverlayStateReturn;
  runner: any;
}) {
  const { refreshRunners, refreshProjectRunners } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLoading, setIsLoading] = useState(false);
  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = (await EditRunner(runner.id, data.name.toString())) as any;
    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to update runner");
      setApiErrorMessage("An error occurred while updating the runner");
      toast.danger("Runner", { description: "Failed to update runner" });
      return;
    }
    if (res.success) {
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      onOpenChange(false);
      toast.success("Runner", { description: "Runner updated successfully" });
      refreshRunners();
      if (runner.project_id) {
        refreshProjectRunners(runner.project_id);
      }
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      toast.danger("Runner", { description: "Failed to update runner" });
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
                        <p className="text-lg font-bold">Edit Runner</p>
                        <p className="text-sm text-muted">
                          Edit the runner details below and click apply changes
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
                          defaultValue={runner.name}
                          name="name"
                        >
                          <Label>{"Name"}</Label>
                          <InputGroup>
                            <InputGroup.Input placeholder="Enter the new runner name" />
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
