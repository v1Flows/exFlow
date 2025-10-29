"use client";

import { Icon } from "@iconify/react";
import { Alert, Button, Card, CardBody, useDisclosure } from "@heroui/react";
import NumberFlow from "@number-flow/react";
import React from "react";

import EditProjectModal from "@/components/modals/projects/edit";
import canEditProject from "@/lib/functions/canEditProject";

import ProjectTabs from "./project/tabs";

export default function Project({
  user,
  settings,
  project,
  runners,
  tokens,
  audit,
  flows,
}: any) {
  const editProjectModal = useDisclosure();

  return (
    <main>
      <Card
        className="mb-4"
        style={{
          // use project.color as shadow color
          boxShadow: `0 4px 6px -1px ${project.color}, 0 2px 4px -1px ${project.color}1A`,
        }}
      >
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                className="h-full"
                icon={
                  project.icon ? project.icon : "solar:question-square-outline"
                }
                width={32}
              />
              <div className="flex flex-col items-start">
                <p className="text-lg font-bold">{project.name}</p>
                <p className="text-sm text-default-500">
                  {project.description}
                </p>
              </div>
            </div>
            <Button
              isIconOnly
              color="warning"
              isDisabled={
                (project.disabled ||
                  !canEditProject(user.id, project.members)) &&
                user.role !== "admin"
              }
              startContent={<Icon icon="hugeicons:pencil-edit-02" width={20} />}
              variant="flat"
              onPress={() => editProjectModal.onOpen()}
            />
          </div>
        </CardBody>
      </Card>
      {project.disabled && (
        <div className="mb-4">
          <Alert
            color="danger"
            description={project.disabled_reason}
            title="Project is currently disabled"
            variant="faded"
          />
        </div>
      )}
      <div>
        <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4">
          <div className="col-span-1">
            <Card fullWidth className="h-full">
              <CardBody>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                    <Icon icon="hugeicons:location-user-02" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold">
                      <NumberFlow
                        locales="en-US" // Intl.NumberFormat locales
                        value={project.members.length}
                      />
                    </p>
                    <p className="text-sm text-default-500">Members</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="col-span-1">
            <Card fullWidth>
              <CardBody>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                    <Icon icon="hugeicons:workflow-square-10" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold">
                      {
                        flows.filter((f: any) => f.project_id === project.id)
                          .length
                      }
                    </p>
                    <p className="text-sm text-default-500">Flows</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="col-span-1">
            <Card fullWidth className="h-full">
              <CardBody>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                    <Icon icon="hugeicons:ai-brain-04" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold">
                      {project.shared_runners ? (
                        <NumberFlow
                          locales="en-US" // Intl.NumberFormat locales
                          value={runners.length}
                        />
                      ) : (
                        <NumberFlow
                          locales="en-US" // Intl.NumberFormat locales
                          value={
                            runners.filter(
                              (r: any) => r.shared_runner === false,
                            ).length
                          }
                        />
                      )}
                    </p>
                    <p className="text-sm text-default-500">Runners</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="col-span-1">
            <Card fullWidth className="h-full">
              <CardBody>
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                    <Icon icon="hugeicons:key-02" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold">
                      <NumberFlow
                        locales="en-US" // Intl.NumberFormat locales
                        value={tokens.length}
                      />
                    </p>
                    <p className="text-sm text-default-500">Tokens</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      <div className="mt-6 w-full">
        <ProjectTabs
          audit={audit}
          project={project}
          runners={runners}
          settings={settings}
          tokens={tokens}
          user={user}
        />
      </div>
      <EditProjectModal disclosure={editProjectModal} project={project} />
    </main>
  );
}
