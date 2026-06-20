"use client";
import { Icon } from "@iconify/react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  Link,
  TextField,
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
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-accent/10 ring-1 ring-accent/20">
            <Icon
              className="text-3xl text-accent"
              icon="hugeicons:user-circle"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome <span className="text-accent">Back</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Log in to your account to continue
          </p>
        </div>

        <Card className="w-full border-none shadow-2xl bg-surface/60 backdrop-blur-md">
          <Card.Content className="px-8 py-8 space-y-6">
            {error && (
              <Alert status={"danger"}>
                <Alert.Indicator></Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>{"Error"}</Alert.Title>
                  <Alert.Description>{errorText}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <TextField
                name="email"
                value={usernameEmail}
                onChange={setUsernameEmail}
              >
                <Label>{"Username / Email"}</Label>
                <InputGroup>
                  <InputGroup.Prefix>
                    {
                      <Icon
                        className="pointer-events-none shrink-0 text-xl text-muted"
                        icon="hugeicons:mail-at-sign-02"
                      />
                    }
                  </InputGroup.Prefix>
                  <Input
                    required
                    placeholder="Enter your username or email"
                    type="text"
                  />
                </InputGroup>
              </TextField>
              <TextField
                isRequired
                name="password"
                value={password}
                onChange={setPassword}
              >
                <Label>{"Password"}</Label>
                <InputGroup>
                  <InputGroup.Prefix>
                    {
                      <Icon
                        className="pointer-events-none shrink-0 text-xl text-muted"
                        icon="hugeicons:lock-key"
                      />
                    }
                  </InputGroup.Prefix>
                  <Input
                    placeholder="Enter your password"
                    type={isVisible ? "text" : "password"}
                  />
                  <InputGroup.Suffix>
                    {
                      <button type="button" onClick={toggleVisibility}>
                        {isVisible ? (
                          <Icon
                            className="pointer-events-none text-xl text-muted"
                            icon="hugeicons:view"
                          />
                        ) : (
                          <Icon
                            className="pointer-events-none text-xl text-muted"
                            icon="hugeicons:view-off"
                          />
                        )}
                      </button>
                    }
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
              <div className="flex items-center justify-between px-1">
                <Checkbox
                  isSelected={rememberMe}
                  name={"remember"}
                  onChange={setRememberMe}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>Remember me</Checkbox.Content>
                </Checkbox>
                <Link className="text-muted" href="#">
                  Forgot password?
                </Link>
              </div>
              <Button
                className="font-bold shadow-lg shadow-accent/20"
                isPending={isLoginLoading}
                type="submit"
                onPress={onLogin}
                variant="primary"
              >
                Login
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-default" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-gray-500">Or</span>
              </div>
            </div>

            {!settings.signup && (
              <Alert status={"danger"}>
                <Alert.Indicator></Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>{"Sign Up Disabled"}</Alert.Title>
                  <Alert.Description>
                    {"Sign up is currently disabled. Please check back later."}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            )}
            <p className="text-center text-sm">
              Need to create an account?&nbsp;
              <Link href="/auth/signup" isDisabled={!settings.signup}>
                Sign Up
              </Link>
            </p>
          </Card.Content>
        </Card>
      </div>
      <Ripple mainCircleOpacity={0.15} numCircles={8} />
    </main>
  );
}
