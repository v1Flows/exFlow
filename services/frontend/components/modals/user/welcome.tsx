"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { LibraryIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import ErrorCard from "@/components/error/ErrorCard";
import Welcomed from "@/lib/fetch/user/PUT/welcomed";

export default function WelcomeModal({
  disclosure,
}: {
  disclosure: UseDisclosureReturn;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function handleSetWelcomed() {
    const response = (await Welcomed()) as any;

    if (!response) {
      setError(true);
      setErrorText("Failed to set welcomed status");
      setErrorMessage("Failed to set welcomed status");
      addToast({
        title: "Welcome",
        description: "Failed to set welcomed status",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange();
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Welcome",
        description: "Failed to set welcomed status",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <Modal
        isDismissable
        backdrop="blur"
        className="border border-2 border-primary-200"
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex-cols flex w-full items-center justify-center">
                <div className="flex-cols flex gap-1 font-bold">
                  New here, huh?
                  <Icon icon="solar:cup-hot-linear" width={28} />
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-center text-lg">
                    Welcome to{" "}
                    <span className="font-semibold text-primary">exFlow</span>!
                    We&apos;re thrilled to have you on board.
                  </p>
                  <p className="text-md text-center">
                    Click on the{" "}
                    <span className="font-bold">&quot;Documentation&quot;</span>{" "}
                    button below to dive in and learn how to make the most out
                    of{" "}
                    <span className="font-semibold text-primary">
                      AlertFlow
                    </span>
                    .
                  </p>
                  <p className="text-md text-center">
                    Or explore it on your own by clicking the{" "}
                    <span className="font-bold">&quot;Understood&quot;</span>{" "}
                    button.
                  </p>

                  <p className="text-sm text-default-500">
                    This dialog will not be shown to you again.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="bordered"
                  onPress={() => {
                    handleSetWelcomed();
                    router.push("/docs");
                    onClose();
                  }}
                >
                  <LibraryIcon />
                  Documentation
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onPress={() => {
                    handleSetWelcomed();
                    onOpenChange();
                  }}
                >
                  <Icon icon="solar:telescope-linear" width={18} />
                  Start Exploring
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
