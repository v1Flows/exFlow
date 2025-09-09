import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import React from "react";

import SimulateAlert from "@/lib/fetch/alert/POST/send";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

export default function SimulateAlertModal({
  disclosure,
  flow,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
}) {
  const { refreshAllAlertCaches } = useRefreshCache();
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [target, setTarget] = React.useState(
    // eslint-disable-next-line no-undef
    `${window.location.origin}/alert/alertmanager`,
  );
  const [payload, setPayload] = React.useState(`{
  "receiver": "${flow.id}",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "Test",
        "dc": "eu-west-1",
        "instance": "localhost:9090",
        "job": "prometheus24"
      },
      "annotations": {
        "description": "some description"
      },
      "startsAt": "2018-08-03T09:52:26.739266876+02:00",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "http://example.com:9090"                                                                                  
    }
  ],
  "groupLabels": {
    "alertname": "Test",
    "job": "prometheus24"
  },
  "commonLabels": {
    "alertname": "Test",
    "dc": "eu-west-1",
    "instance": "localhost:9090",
    "job": "prometheus24"
  },
  "commonAnnotations": {
    "description": "some description"
  },
  "externalURL": "http://example.com:9093",
  "version": "4",
  "groupKey": "test"
}`);

  async function sendPayload() {
    setIsLoading(true);
    const send = (await SimulateAlert(target, payload)) as any;

    if (!send) {
      setError(true);
      setErrorText("Failed to send alert!");
      setErrorMessage("Please try again later.");
      setIsLoading(false);
      addToast({
        title: "Alert Simulation",
        description: "Failed to send alert!",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (!send.success) {
      setError(true);
      setErrorText(send.error);
      setErrorMessage(send.message);
      addToast({
        title: "Alert Simulation",
        description: "Failed to send alert!",
        color: "danger",
        variant: "flat",
      });
    } else {
      refreshAllAlertCaches(flow.id);
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Alert Simulation",
        description: "Alert sent successfully!",
        color: "success",
        variant: "flat",
      });
    }

    setIsLoading(false);
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Simulate an Alert</p>
                  <p className="text-sm text-default-500">
                    With this Simulation you can test your Flow with a
                    predefined payload.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Input
                  description="The target URL where the payload will be sent to."
                  label="Target"
                  labelPlacement="outside"
                  value={target}
                  onValueChange={setTarget}
                />
                <Textarea
                  isRequired
                  label="Payload JSON"
                  labelPlacement="outside"
                  maxRows={65}
                  value={JSON.parse(JSON.stringify(payload, null, 2))}
                  onValueChange={setPayload}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="bordered" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="secondary"
                  isLoading={isLoading}
                  variant="flat"
                  onPress={sendPayload}
                >
                  <Icon icon="hugeicons:mail-send-02" width={20} />
                  Send
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
