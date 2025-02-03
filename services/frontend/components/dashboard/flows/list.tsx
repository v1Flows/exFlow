import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { CircularProgress } from "@heroui/progress";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function FlowList() {
  const router = useRouter();

  return (
    <main>
      <p className="text-md font-bold text-default-500 mb-2">Folders</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card
          fullWidth
          isPressable
          className="bg-primary bg-opacity-10 border-2 border-primary p-3"
          onPress={() => router.push("/flows/folder/1")}
        >
          <CardBody className="flex flex-col items-center justify-center gap-2">
            <Icon className="text-3xl" icon="solar:folder-with-files-linear" />
            <p>Folder 1</p>
          </CardBody>
        </Card>
      </div>

      <p className="text-md font-bold text-default-500 mb-2">Flows</p>

      <div className="flex flex-col gap-4">
        {/* Running Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
            <div className="flex items-center justify-center">
              <CircularProgress aria-label="Loading..." size="lg" />
            </div>
            <div className="text-center">
              <p>Ansible</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <div className="text-center">
              <p>3</p>
              <p className="text-sm text-default-500">Total Executions</p>
            </div>
            <div className="text-center">
              <p>01.02.2025</p>
              <p className="text-sm text-default-500">Last Failed</p>
            </div>
            <div className="text-center">
              <p>31.01.2025</p>
              <p className="text-sm text-default-500">Last Success</p>
            </div>
            <Button
              isDisabled
              isIconOnly
              className="justify-self-center"
              variant="flat"
              color="success"
            >
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>

        {/* Success Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
          <div className="flex items-center justify-center">
            <CircularProgress
              showValueLabel
              aria-label="Loading..."
              size="lg"
              value={100}
              color="success"
              valueLabel={
                <Icon
                  className="text-2xl text-success"
                  icon="solar:check-read-linear"
                />
              }
            />
            </div>
            <div className="text-center">
              <p>Terraform</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <div className="text-center">
              <p>3</p>
              <p className="text-sm text-default-500">Total Executions</p>
            </div>
            <div className="text-center">
              <p>01.02.2025</p>
              <p className="text-sm text-default-500">Last Failed</p>
            </div>
            <div className="text-center">
              <p>31.01.2025</p>
              <p className="text-sm text-default-500">Last Success</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat" color="success">
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>

        {/* Interaction Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
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
              <p>Terraform</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <div className="text-center">
              <p>3</p>
              <p className="text-sm text-default-500">Total Executions</p>
            </div>
            <div className="text-center">
              <p>01.02.2025</p>
              <p className="text-sm text-default-500">Last Failed</p>
            </div>
            <div className="text-center">
              <p>31.01.2025</p>
              <p className="text-sm text-default-500">Last Success</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat" color="success">
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>

        {/* Warning Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
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
              <p>Terraform</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <div className="text-center">
              <p>3</p>
              <p className="text-sm text-default-500">Total Executions</p>
            </div>
            <div className="text-center">
              <p>01.02.2025</p>
              <p className="text-sm text-default-500">Last Failed</p>
            </div>
            <div className="text-center">
              <p>31.01.2025</p>
              <p className="text-sm text-default-500">Last Success</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat" color="success">
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>

        {/* Failed Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
          <div className="flex items-center justify-center">
            <CircularProgress
              showValueLabel
              aria-label="Loading..."
              color="danger"
              size="lg"
              value={100}
              valueLabel={
                <Icon className="text-2xl text-danger" icon="gridicons:cross" />
              }
            />
            </div>
            <div className="text-center">
              <p>Terraform</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <div className="text-center">
              <p>12 Seconds</p>
              <p className="text-sm text-default-500">Duration</p>
            </div>
            <div className="text-center">
              <p>3</p>
              <p className="text-sm text-default-500">Total Executions</p>
            </div>
            <div className="text-center">
              <p>01.02.2025</p>
              <p className="text-sm text-default-500">Last Failed</p>
            </div>
            <div className="text-center">
              <p>31.01.2025</p>
              <p className="text-sm text-default-500">Last Success</p>
            </div>
            <Button isIconOnly className="justify-self-center" variant="flat" color="success">
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
