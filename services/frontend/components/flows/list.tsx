"use client";

import { Card, CardBody, Button, CircularProgress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FlowList({
  flows,
  folders,
}: {
  flows: any;
  folders: any;
}) {
  const router = useRouter();

  const [filteredFolders, setFilteredFolders] = useState(
    folders.filter((f: any) => f.parent_id === ""),
  );
  const [filteredFlows, setFilteredFlows] = useState(
    flows.filter((f: any) => f.folder_id === ""),
  );

  // get folder id from query params
  const searchParams = useSearchParams();
  const searchFolderID = searchParams.get("folder");

  useEffect(() => {
    if (searchFolderID) {
      setFilteredFolders(
        folders.filter((f: any) => f.parent_id === searchFolderID),
      );
      setFilteredFlows(
        flows.filter((f: any) => f.folder_id === searchFolderID),
      );
    } else {
      setFilteredFolders(folders.filter((f: any) => f.parent_id === ""));
      setFilteredFlows(flows);
    }
  }, [searchFolderID]);

  return (
    <main>
      <p className="text-md font-bold text-default-500 mb-2">
        Folders{" "}
        {searchFolderID && (
          <span className="text-primary font-bold">
            | Current: {folders.find((f: any) => f.id === searchFolderID)?.name}
          </span>
        )}
      </p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {searchFolderID && (
          <Card
            fullWidth
            isPressable
            className="bg-default-200 bg-opacity-10 border-2 border-default p-3"
            onPress={() => router.back()}
          >
            <CardBody className="flex flex-col items-center justify-center gap-2">
              <Icon className="text-3xl" icon="hugeicons:link-backward" />
              <p>Back</p>
            </CardBody>
          </Card>
        )}
        {filteredFolders.map((folder: any) => (
          <Card
            key={folder.id}
            fullWidth
            isPressable
            className="bg-primary bg-opacity-10 border-2 border-primary p-3"
            onPress={() => router.push("/flows?folder=" + folder.id)}
          >
            <CardBody className="flex flex-col items-center justify-center gap-2">
              <Icon className="text-3xl" icon="hugeicons:folder-01" />
              <p>{folder.name}</p>
            </CardBody>
          </Card>
        ))}
        {folders.length === 0 && (
          <p className="text-default-500 text-center col-span-4">
            No folders found
          </p>
        )}
      </div>

      <p className="text-md font-bold text-default-500 mb-2">
        Flows <span className="text-tiny">(without folder)</span>
      </p>

      <div className="flex flex-col gap-4">
        {/* Running Flow Card */}
        {filteredFlows.length === 0 && (
          <p className="text-default-500 text-center">No flows found</p>
        )}
        {filteredFlows.map((flow: any) => (
          <Card
            key={flow.id}
            fullWidth
            isPressable
            onPress={() => router.push("/flow/1")}
          >
            <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
              <div className="flex items-center justify-center">
                <CircularProgress aria-label="Loading..." size="lg" />
              </div>
              <div className="text-center">
                <p>Ansible</p>
                <p className="text-sm text-default-500">
                  This is the Description
                </p>
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
                color="success"
                variant="flat"
              >
                <Icon icon="solar:play-linear" />
              </Button>
            </CardBody>
          </Card>
        ))}

        {/* Success Flow Card */}
        <Card fullWidth isPressable>
          <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
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
              <p>Terraform</p>
              <p className="text-sm text-default-500">
                This is the Description
              </p>
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
              isIconOnly
              className="justify-self-center"
              color="success"
              variant="flat"
            >
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
              <p className="text-sm text-default-500">
                This is the Description
              </p>
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
              isIconOnly
              className="justify-self-center"
              color="success"
              variant="flat"
            >
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
              <p className="text-sm text-default-500">
                This is the Description
              </p>
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
              isIconOnly
              className="justify-self-center"
              color="success"
              variant="flat"
            >
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
                  <Icon
                    className="text-2xl text-danger"
                    icon="gridicons:cross"
                  />
                }
              />
            </div>
            <div className="text-center">
              <p>Terraform</p>
              <p className="text-sm text-default-500">
                This is the Description
              </p>
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
              isIconOnly
              className="justify-self-center"
              color="success"
              variant="flat"
            >
              <Icon icon="solar:play-linear" />
            </Button>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
