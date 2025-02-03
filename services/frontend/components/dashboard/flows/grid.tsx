import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { CircularProgress, Progress } from "@heroui/progress";
import { Icon } from "@iconify/react";

export default function FlowGrid() {
  return (
    <main>
      <p className="text-md font-bold text-default-500 mb-2">Folders</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card
          fullWidth
          isPressable
          className="bg-primary bg-opacity-10 border-2 border-primary p-3"
        >
          <CardBody className="flex flex-col items-center justify-center gap-2">
            <Icon className="text-3xl" icon="solar:folder-with-files-linear" />
            <p>Folder 1</p>
          </CardBody>
        </Card>
      </div>

      <p className="text-md font-bold text-default-500 mb-2">Flows</p>

      <div className="grid grid-cols-4 gap-4">
        {/* Running Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex flex-cols items-center text-start justify-between gap-4">
            <div>
              <p>Ansible</p>
              <p className="text-sm text-default-500">This is the Description</p>
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
          </CardHeader>
          <CardBody className="grid grid-cols-2 items-center justify-center gap-2">
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
          </CardBody>
          <CardFooter>
            <Progress size="sm" isIndeterminate />
          </CardFooter>
        </Card>

        {/* Success Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex flex-cols items-center text-start justify-between gap-4">
            <div>
              <p>Ansible</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <Button
              isIconOnly
              className="justify-self-center"
              variant="flat"
              color="success"
            >
              <Icon icon="solar:play-linear" />
            </Button>
          </CardHeader>
          <CardBody className="grid grid-cols-2 items-center justify-center gap-2">
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
          </CardBody>
          <CardFooter>
            <Progress size="sm" color="success" value={100} />
          </CardFooter>
        </Card>

        {/* Interaction Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex flex-cols items-center text-start justify-between gap-4">
            <div>
              <p>Ansible</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <Button
              isIconOnly
              className="justify-self-center"
              variant="flat"
              color="success"
            >
              <Icon icon="solar:play-linear" />
            </Button>
          </CardHeader>
          <CardBody className="grid grid-cols-2 items-center justify-center gap-2">
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
          </CardBody>
          <CardFooter className="flex flex-col items-start justify-center gap-1">
            <p className="text-sm font-semibold text-primary">Interaction Required</p>
            <Progress size="sm" color="primary" isIndeterminate />
          </CardFooter>
        </Card>

        {/* Warning Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex flex-cols items-center text-start justify-between gap-4">
            <div>
              <p>Ansible</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <Button
              isIconOnly
              className="justify-self-center"
              variant="flat"
              color="success"
            >
              <Icon icon="solar:play-linear" />
            </Button>
          </CardHeader>
          <CardBody className="grid grid-cols-2 items-center justify-center gap-2">
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
          </CardBody>
          <CardFooter>
            <Progress size="sm" color="warning" value={100} />
          </CardFooter>
        </Card>

        {/* Failed Flow Card */}
        <Card fullWidth isPressable>
          <CardHeader className="flex flex-cols items-center text-start justify-between gap-4">
            <div>
              <p>Ansible</p>
              <p className="text-sm text-default-500">This is the Description</p>
            </div>
            <Button
              isIconOnly
              className="justify-self-center"
              variant="flat"
              color="success"
            >
              <Icon icon="solar:play-linear" />
            </Button>
          </CardHeader>
          <CardBody className="grid grid-cols-2 items-center justify-center gap-2">
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
          </CardBody>
          <CardFooter>
            <Progress size="sm" color="danger" value={100} />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
