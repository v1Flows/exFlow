import { Alert } from "@heroui/react";

export default function ErrorCard({ error, message }) {
  return <Alert color="danger" description={message} title={error} />;
}
