"use client";

import { Icon } from "@iconify/react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Checkbox,
  Input,
  Link,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { setSession } from "@/lib/setSession";
import LoginAPI from "@/lib/auth/login";

import { Ripple } from "../magicui/ripple";

export default function LoginPageComponent({ settings }: { settings: any }) {
  const router = useRouter();

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [usernameEmail, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  async function onLogin() {
    setIsLoginLoading(true);
    setError(false);
    setErrorText("");

    const res = await LoginAPI(usernameEmail, password, rememberMe);

    if (!res.error) {
      await setSession(res.token, res.user, res.expires_at);
      router.push("/");
      setIsLoginLoading(false);
    } else {
      setIsLoginLoading(false);
      setError(true);
      setErrorText(res.message || "An unknown error occurred during login.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Icon
              className="text-3xl text-primary"
              icon="hugeicons:user-circle"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome <span className="text-primary">Back</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Log in to your account to continue
          </p>
        </div>

        <Card className="w-full border-none shadow-2xl bg-content1/60 backdrop-blur-md">
          <CardBody className="px-8 py-8 space-y-6">
            {error && (
              <Alert
                color="danger"
                description={errorText}
                title="Error"
                variant="flat"
              />
            )}

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                required
                label="Username / Email"
                name="email"
                placeholder="Enter your username or email"
                startContent={
                  <Icon
                    className="pointer-events-none shrink-0 text-xl text-default-400"
                    icon="hugeicons:mail-at-sign-02"
                  />
                }
                type="text"
                value={usernameEmail}
                variant="bordered"
                onValueChange={setUsernameEmail}
              />
              <Input
                isRequired
                endContent={
                  <button type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                      <Icon
                        className="pointer-events-none text-xl text-default-400"
                        icon="hugeicons:view"
                      />
                    ) : (
                      <Icon
                        className="pointer-events-none text-xl text-default-400"
                        icon="hugeicons:view-off"
                      />
                    )}
                  </button>
                }
                label="Password"
                name="password"
                placeholder="Enter your password"
                startContent={
                  <Icon
                    className="pointer-events-none shrink-0 text-xl text-default-400"
                    icon="hugeicons:lock-key"
                  />
                }
                type={isVisible ? "text" : "password"}
                value={password}
                variant="bordered"
                onValueChange={setPassword}
              />
              <div className="flex items-center justify-between px-1">
                <Checkbox
                  isSelected={rememberMe}
                  name="remember"
                  size="sm"
                  onValueChange={setRememberMe}
                >
                  Remember me
                </Checkbox>
                <Link className="text-default-500" href="#" size="sm">
                  Forgot password?
                </Link>
              </div>
              <Button
                className="font-bold shadow-lg shadow-primary/20"
                color="primary"
                isLoading={isLoginLoading}
                type="submit"
                onPress={onLogin}
              >
                Login
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-default-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-gray-500">Or</span>
              </div>
            </div>

            {!settings.signup && (
              <Alert
                color="danger"
                description="Sign up is currently disabled. Please check back later."
                title="Sign Up Disabled"
                variant="faded"
              />
            )}
            <p className="text-center text-small">
              Need to create an account?&nbsp;
              <Link href="/auth/signup" isDisabled={!settings.signup} size="sm">
                Sign Up
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
      <Ripple mainCircleOpacity={0.15} numCircles={8} />
    </main>
  );
}
