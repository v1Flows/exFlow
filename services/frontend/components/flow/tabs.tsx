import { Card, CardBody } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import FlowExecutions from "./executions";

export default function FlowTabs() {
  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Options">
        <Tab key="details" title="Details">
          <Card>
            <CardBody>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </CardBody>
          </Card>
        </Tab>
        <Tab key="executions" title="Executions">
          <FlowExecutions />
        </Tab>
      </Tabs>
    </div>
  )
}