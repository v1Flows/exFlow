import { Card, CardBody, Button, CircularProgress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function FlowExecutions() {
  const router = useRouter();

  return (
    <main>
      <p className="text-md font-bold text-default-500 mb-2">Executions</p>

      <div className="flex flex-col gap-4">
        {/* Running Flow Card */}
        <Card fullWidth isPressable onPress={() => router.push("/flow/1")}>
          <CardBody className="grid grid-cols-4 items-center justify-center gap-4">
            <div className="flex items-center justify-center">
              <CircularProgress aria-label="Loading..." size="lg" />
            </div>
            <div className="text-center">
              <p>20min ago</p>
              <p className="text-sm text-default-500">Executed At</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon
                className="text-2xl"
                icon="solar:double-alt-arrow-right-line-duotone"
              />
            </Button>
          </CardBody>
        </Card>

        {/* Success Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-4 items-center justify-center gap-4">
            <div className="flex items-center justify-center">
              <CircularProgress
                showValueLabel
                aria-label="Loading..."
                color="success"
                size="lg"
                value={100}
                valueLabel={
                  <Icon
                    className="text-2xl text-success"
                    icon="solar:check-read-linear"
                  />
                }
              />
            </div>
            <div className="text-center">
              <p>20min ago</p>
              <p className="text-sm text-default-500">Executed At</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon
                className="text-2xl"
                icon="solar:double-alt-arrow-right-line-duotone"
              />
            </Button>
          </CardBody>
        </Card>

        {/* Interaction Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-4 items-center justify-center gap-4">
            <div className="flex items-center justify-center">
              <CircularProgress
                showValueLabel
                aria-label="Loading..."
                size="lg"
                value={100}
                valueLabel={
                  <Icon
                    className="text-2xl text-primary"
                    icon="solar:hand-shake-linear"
                  />
                }
              />
            </div>
            <div className="text-center">
              <p>20min ago</p>
              <p className="text-sm text-default-500">Executed At</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon
                className="text-2xl"
                icon="solar:double-alt-arrow-right-line-duotone"
              />
            </Button>
          </CardBody>
        </Card>

        {/* Warning Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-4 items-center justify-center gap-4">
            <div className="flex items-center justify-center">
              <CircularProgress
                showValueLabel
                aria-label="Loading..."
                color="warning"
                size="lg"
                value={100}
                valueLabel={
                  <Icon
                    className="text-2xl text-warning"
                    icon="solar:shield-warning-linear"
                  />
                }
              />
            </div>
            <div className="text-center">
              <p>20min ago</p>
              <p className="text-sm text-default-500">Executed At</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon
                className="text-2xl"
                icon="solar:double-alt-arrow-right-line-duotone"
              />
            </Button>
          </CardBody>
        </Card>

        {/* Failed Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-4 items-center justify-center gap-4">
            <div className="flex items-center justify-center">
              <CircularProgress
                showValueLabel
                aria-label="Loading..."
                color="danger"
                size="lg"
                value={100}
                valueLabel={
                  <Icon
                    className="text-2xl text-danger"
                    icon="gridicons:cross"
                  />
                }
              />
            </div>
            <div className="text-center">
              <p>20min ago</p>
              <p className="text-sm text-default-500">Executed At</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon
                className="text-2xl"
                icon="solar:double-alt-arrow-right-line-duotone"
              />
            </Button>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
