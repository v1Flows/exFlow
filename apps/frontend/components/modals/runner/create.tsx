"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
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
  useOverlayState,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import AddRunner from "@/lib/fetch/runner/POST/AddRunner";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function CreateRunnerModal({
  disclosure,
  project,
  shared_runner,
}: {
  disclosure: UseOverlayStateReturn;
  project: any;
  shared_runner: any;
}) {
  const { refreshProjectRunners } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  // instructions modal
  const { isOpen: isOpenInstructions, setOpen: onOpenChangeInstructions } =
    useOverlayState();
  const [inApikey, setInApikey] = useState("");
  const [inRunnerId, setInRunnerId] = useState("");
  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = (await AddRunner(
      project.id ? project.id : "none",
      data.name.toString(),
      shared_runner,
    )) as any;
    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to create runner");
      setApiErrorMessage("An error occurred while creating the runner");
      toast.danger("Runner", { description: "Failed to create runner" });
      return;
    }
    if (res.success) {
      onOpenChange(false);
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      // set variables
      setInApikey(res.data.token);
      setInRunnerId(res.data.runner.id);
      onOpenChangeInstructions(true);
      refreshProjectRunners(project.id);
      toast.success("Runner", { description: "Runner created successfully" });
    } else {
      setApiError(true);
      setApiErrorText(res.error.error);
      setApiErrorMessage(res.error.message);
      toast.danger("Runner", {
        description: `Failed to create runner: ${res.error.error}`,
      });
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
                        <p className="text-lg font-bold">Add Runner</p>
                        <p className="text-sm text-muted">
                          Add a new persistent runner to the project.
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
                        <TextField isRequired name="name">
                          <Label>{"Name"}</Label>
                          <InputGroup>
                            <Input placeholder="Enter the runner name" />
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
      <Modal>
        <Modal.Backdrop
          isOpen={isOpenInstructions}
          onOpenChange={onOpenChangeInstructions}
        >
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <p className="text-lg font-bold text-success">
                        Runner Created
                      </p>
                      <p className="text-sm text-muted">
                        Enter the informations below in your runner config
                      </p>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <div>
                      <p className="text-sm font-bold text-muted">runner_id</p>
                      <CopySnippet showPrompt={false} className="w-full">
                        {inRunnerId}
                      </CopySnippet>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-muted">api_key</p>
                      <CopySnippet
                        showPrompt={false}
                        className="w-full"
                        value={inApikey}
                      >
                        <span>{`${inApikey.slice(0, 30)}...`}</span>
                      </CopySnippet>
                      <p className="text-sm text-muted">
                        The Token can always be found on the &quot;Tokens&quot;
                        tab.
                      </p>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button onPress={onClose}>
                      {<Icon icon="hugeicons:tick-01" width={18} />}
                      <span>Understood</span>
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
