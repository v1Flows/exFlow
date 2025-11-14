"use client";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";

export function AdminSystemStatus() {
  return (
    <main>
      <Card>
        <CardHeader>
          <p className="text-lg font-bold">System Status</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center justify-between gap-4">
            <Card>
              <CardBody className="bg-content2">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                    <Icon icon="hugeicons:chip" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold text-success">Healthy</p>
                    <p className="text-sm text-default-500">Backend</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="bg-content2">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                    <Icon icon="hugeicons:setup-02" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold text-success">Complete</p>
                    <p className="text-sm text-default-500">Setup</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
