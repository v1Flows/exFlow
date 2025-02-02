import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { CircularProgress } from "@heroui/progress";
import { Icon } from "@iconify/react";

export default function FlowList() {
  return (
    <main>
      <p className="text-md font-bold text-default-500 mb-2">Folders</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card fullWidth isPressable className="bg-primary bg-opacity-20 p-10">
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
          <CardHeader className="flex items-center justify-between">
            <Chip color="danger" radius="sm" size="sm" variant="flat">
              Disabled
            </Chip>
          </CardHeader>
          <CardBody className="grid grid-cols-6 items-center justify-center gap-4">
            <CircularProgress
              aria-label="Loading..."
              className="justify-self-center"
              size="lg"
            />
            <div className="text-center">
              <p>Terraform</p>
              <p className="text-sm text-default-500">Description</p>
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
            >
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>

        {/* Interaction Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex items-center justify-between">
            <Chip color="success" radius="sm" size="sm" variant="flat">
              Enabled
            </Chip>
          </CardHeader>
          <CardBody className="grid grid-cols-6 items-center justify-center gap-4">
            <div className="flex flex-cols items-center justify-center gap-2">
              <CircularProgress
                showValueLabel
                aria-label="Loading..."
                size="lg"
                value={100}
                valueLabel={
                  <Icon
                    className="text-xl text-primary"
                    icon="solar:hand-shake-linear"
                  />
                }
              />
              <p className="text-md font-semibold text-primary">Interaction</p>
            </div>
            <div className="text-center">
              <p>Terraform</p>
              <p className="text-sm text-default-500">Description</p>
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
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>

        {/* Warning Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex items-center justify-between">
            <Chip color="success" radius="sm" size="sm" variant="flat">
              Enabled
            </Chip>
          </CardHeader>
          <CardBody className="grid grid-cols-6 items-center justify-center gap-4">
            <div className="flex flex-cols items-center justify-center gap-2">
              <CircularProgress
                showValueLabel
                aria-label="Loading..."
                color="warning"
                size="lg"
                value={100}
                valueLabel={
                  <Icon
                    className="text-xl text-warning"
                    icon="solar:shield-warning-linear"
                  />
                }
              />
              <p className="text-md font-semibold text-warning">Warning</p>
            </div>
            <div className="text-center">
              <p>Terraform</p>
              <p className="text-sm text-default-500">Description</p>
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
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>

        {/* Failed Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex items-center justify-between">
            <Chip color="success" radius="sm" size="sm" variant="flat">
              Enabled
            </Chip>
          </CardHeader>
          <CardBody className="grid grid-cols-6 items-center justify-center gap-4">
            <div className="flex flex-cols items-center justify-center gap-2">
              <CircularProgress
                showValueLabel
                aria-label="Loading..."
                color="danger"
                size="lg"
                value={100}
                valueLabel={
                  <Icon
                    className="text-xl text-danger"
                    icon="gridicons:cross"
                  />
                }
              />
              <p className="text-md font-semibold text-danger">Failed</p>
            </div>
            <div className="text-center">
              <p>Terraform</p>
              <p className="text-sm text-default-500">Description</p>
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
            <Button isIconOnly className="justify-self-center" variant="flat">
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
