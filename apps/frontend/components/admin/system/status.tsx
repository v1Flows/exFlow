"use client";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";

export function AdminSystemStatus() {
  return (
    <main>
      <Card>
        <Card.Header>
          <p className="text-lg font-bold">System Status</p>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center justify-between gap-4">
            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-sm bg-default/30 text-foreground">
                    <Icon icon="hugeicons:chip" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold text-success">Healthy</p>
                    <p className="text-sm text-muted">Backend</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-sm bg-default/30 text-foreground">
                    <Icon icon="hugeicons:setup-02" width={24} />
                  </div>
                  <div>
                    <p className="text-md font-bold text-success">Complete</p>
                    <p className="text-sm text-muted">Setup</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </Card.Content>
      </Card>
    </main>
  );
}
