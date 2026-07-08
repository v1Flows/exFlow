import {
  Button,
  Description,
  FieldError,
  InputGroup,
  Label,
  Modal,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import SimulateAlert from "@/lib/fetch/alert/POST/send";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function SimulateAlertModal({
  disclosure,
  flow,
}: {
  disclosure: UseOverlayStateReturn;
  flow: any;
}) {
  const { refreshAllAlertCaches } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
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
      toast.danger("Alert Simulation", {
        description: "Failed to send alert!",
      });
      return;
    }
    if (!send.success) {
      setError(true);
      setErrorText(send.error);
      setErrorMessage(send.message);
      toast.danger("Alert Simulation", {
        description: "Failed to send alert!",
      });
    } else {
      refreshAllAlertCaches(flow.id);
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Alert Simulation", {
        description: "Alert sent successfully!",
      });
    }
    setIsLoading(false);
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center" scroll="inside" size="lg">
            <Modal.Dialog className="w-full">
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold">Simulate an Alert</p>
                        <p className="text-sm text-muted">
                          With this Simulation you can test your Flow with a
                          predefined payload.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <TextField value={target} onChange={setTarget}>
                      <Label>{"Target"}</Label>
                      <InputGroup>
                        <InputGroup.Input />
                      </InputGroup>
                      <Description>
                        {"The target URL where the payload will be sent to."}
                      </Description>
                    </TextField>
                    <TextField
                      isRequired
                      value={JSON.parse(JSON.stringify(payload, null, 2))}
                      onChange={setPayload}
                    >
                      <Label>{"Payload JSON"}</Label>
                      <InputGroup.TextArea />
                    </TextField>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="outline" onPress={onClose}>
                      Close
                    </Button>
                    <Button isPending={isLoading} onPress={sendPayload}>
                      <Icon icon="hugeicons:mail-send-02" width={20} />
                      Send
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
