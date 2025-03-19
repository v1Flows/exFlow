"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
  User,
} from "@heroui/react";
import { LogInIcon, UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Logout } from "@/lib/logout";

export default function Login({ user, session, showSignUp, settings }: any) {
  const router = useRouter();

  const userData = user;

  async function LogoutHandler() {
    await Logout();
  }

  return (
    <>
      {userData?.username && (
        <Dropdown>
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="primary"
              name={userData?.username}
              radius="sm"
              size="sm"
            />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Dropdown menu with description"
            variant="faded"
          >
            <DropdownItem key="user" showDivider>
              <User
                avatarProps={{
                  size: "sm",
                  radius: "sm",
                  name: userData?.username,
                }}
                classNames={{
                  name:
                    userData?.role === "admin" ? "text-danger font-bold" : "",
                }}
                description={userData?.email}
                name={
                  userData?.role === "admin"
                    ? `${userData?.username} | ${userData?.role}`
                    : userData?.username
                }
              />
            </DropdownItem>
            <DropdownItem
              key="profile"
              onPress={() => router.push(`/user/${userData?.id}`)}
            >
              Profile
            </DropdownItem>
            <DropdownItem
              key="api_key"
              showDivider
              startContent={<Icon icon="solar:copy-outline" width={18} />}
              onPress={() => {
                navigator.clipboard.writeText(session);
                addToast({
                  title: "Token",
                  description: "Copied to clipboard",
                  color: "success",
                  variant: "flat",
                });
              }}
            >
              Copy Token
            </DropdownItem>
            <DropdownItem
              key="logout"
              className="text-danger"
              color="danger"
              onPress={LogoutHandler}
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}
      {!userData?.username && (
        <>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<LogInIcon />}
              variant="flat"
              onPress={() => router.push("/auth/login")}
            >
              Login
            </Button>
            {showSignUp && settings.signup && (
              <Button
                color="secondary"
                startContent={<UserPlusIcon />}
                variant="flat"
                onPress={() => router.push("/auth/signup")}
              >
                Sign Up
              </Button>
            )}
            {showSignUp && !settings.signup && (
              <Tooltip
                color="default"
                content={
                  <div className="px-1 py-2">
                    <div className="text-small font-bold text-danger">
                      Disabled
                    </div>
                    <div className="text-tiny">
                      Sign Up is currently disabled
                    </div>
                  </div>
                }
                offset={15}
                placement="bottom"
              >
                <span>
                  <Button
                    isDisabled
                    color="secondary"
                    startContent={<UserPlusIcon />}
                    variant="flat"
                  >
                    Sign Up
                  </Button>
                </span>
              </Tooltip>
            )}
          </div>
        </>
      )}
    </>
  );
}
