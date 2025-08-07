import { Card, CardBody, Snippet, Spacer } from "@heroui/react";

export default function FlowInfo({ flow }: { flow: any }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody>
          <div className="grid lg:grid-cols-2 grid-cols-1 items-center justify-between gap-8">
            <div>
              <p className="text-md font-bold">Flow ID</p>
              <p className="text-sm text-default-500">
                The unique identifier for this flow
              </p>
            </div>
            <Snippet hideSymbol>{flow.id}</Snippet>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="grid lg:grid-cols-2 grid-cols-1 items-center justify-between gap-8">
            <div>
              <p className="text-md font-bold">Remote Execute Flow</p>
              <p className="text-sm text-default-500">
                This flow can be executed remotely via the API. You can use the
                following endpoint to start an execution:
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Snippet hideSymbol>
                {`${process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/${flow.id}/execute`}
              </Snippet>
              <p className="text-tiny text-default-500">URL</p>
              <Spacer />
              <Snippet hideSymbol>POST</Snippet>
              <p className="text-tiny text-default-500">Method</p>
              <Spacer />
              <Snippet hideSymbol>{`Authorization: <your_api_token>`}</Snippet>
              <p className="text-tiny text-default-500">Headers</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
