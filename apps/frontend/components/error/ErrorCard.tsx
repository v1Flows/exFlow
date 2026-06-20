"use client";

import { Alert } from "@heroui/react";

export default function ErrorCard({ error, message }) {
  return (
    <Alert status={"danger"}>
      <Alert.Indicator></Alert.Indicator>
      <Alert.Content>
        <Alert.Title>{error}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
