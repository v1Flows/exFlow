"use client";
import { Avatar, Button, Dropdown, Tooltip } from "@heroui/react";
import { LogInIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Logout } from "@/lib/logout";
export default function Login({ user, _, showSignUp, settings }: any) {
  const router = useRouter();
  const userData = user;
  async function LogoutHandler() {
    await Logout();
  }
  return (
    <>
      {userData?.username && (
        <Dropdown>
          <Dropdown.Trigger>
            <Avatar className={"transition-transform"} size={"sm"}>
              <Avatar.Fallback>
                {String("").slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
          </Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu aria-label="Dropdown menu with description">
              <Dropdown.Item key="user" id="user" textValue=" ">
                <div className={`flex items-center gap-3 ${""}`}>
                  <Avatar>
                    <Avatar.Fallback>
                      {String("").slice(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate">
                      {userData?.role === "admin"
                        ? `${userData?.username} | ${userData?.role}`
                        : userData?.username}
                    </div>
                    <div className="truncate text-sm text-muted">
                      {userData?.email}
                    </div>
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Item
                key="logout"
                id="logout"
                className="text-danger"
                onPress={LogoutHandler}
                textValue="Logout"
              >
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      )}
      {!userData?.username && (
        <>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onPress={() => router.push("/auth/login")}
            >
              {<LogInIcon />}
              Login
            </Button>
            {showSignUp && settings.signup && (
              <Button
                variant="tertiary"
                onPress={() => router.push("/auth/signup")}
              >
                {<PlusIcon />}
                Sign Up
              </Button>
            )}
            {showSignUp && !settings.signup && (
              <Tooltip>
                <Tooltip.Trigger>
                  <span>
                    <Button isDisabled variant="tertiary">
                      {<PlusIcon />}
                      Sign Up
                    </Button>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content placement="bottom">
                  {
                    <div className="px-1 py-2">
                      <div className="text-sm font-bold text-danger">
                        Disabled
                      </div>
                      <div className="text-xs">
                        Sign Up is currently disabled
                      </div>
                    </div>
                  }
                </Tooltip.Content>
              </Tooltip>
            )}
          </div>
        </>
      )}
    </>
  );
}
