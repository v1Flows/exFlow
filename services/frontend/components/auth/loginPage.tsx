"use client";

import { Icon } from "@iconify/react";
import {
  Button,
  Checkbox,
  Image,
  Input,
  Link,
  Alert,
  Divider,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { setSession } from "@/lib/setSession";
import LoginAPI from "@/lib/auth/login";

import { Particles } from "../magicui/particles";

export default function LoginPageComponent({ settings }: { settings: any }) {
  const { theme } = useTheme();
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
      setErrorText(res.error);
    }
  }

  return (
    <div className="relative flex size-full flex-col items-center justify-center">
      <Particles
        refresh
        className="absolute inset-0"
        color={theme === "light" ? "#000" : "#fff"}
        ease={80}
        quantity={100}
      />
      <div className="flex flex-col items-center pb-2">
        <Image
          alt="Logo"
          height={28}
          radius="none"
          shadow="none"
          src={`/images/ef_logo_512.png`}
          width={28}
        />
        <p className="text-xl font-medium">Welcome Back</p>
        <p className="text-small text-default-500">
          Log in to your account to continue
        </p>
      </div>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 py-6 shadow-small">
        {error && (
          <Alert color="danger" description={errorText} title="Error" />
        )}
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            required
            endContent={
              <Icon
                className="pointer-events-none shrink-0 text-2xl text-default-400"
                icon="hugeicons:mail-at-sign-02"
              />
            }
            label="Username / Email"
            name="email"
            placeholder="Enter your username or email"
            type="text"
            value={usernameEmail}
            variant="flat"
            onValueChange={setUsernameEmail}
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            value={password}
            variant="flat"
            onValueChange={setPassword}
          />
          <div className="flex items-center justify-between px-1 py-2">
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
            color="primary"
            isLoading={isLoginLoading}
            type="submit"
            onPress={onLogin}
          >
            Login
          </Button>
        </form>
        <Divider className="my-2" />
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm text-default-500">
            Or continue with
          </p>
          <div className="grid grid-cols-3 gap-2">
            <OIDCProviderButton
              icon="mdi:github"
              label="GitHub"
              provider="github"
            />
            <OIDCProviderButton
              icon="mdi:google"
              label="Google"
              provider="google"
            />
            <OIDCProviderButton
              icon="mdi:key"
              label="Keycloak"
              provider="keycloak"
            />
          </div>
        </div>
        <Divider className="my-2" />
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
      </div>
    </div>
  );
}

interface OIDCProviderButtonProps {
  provider: string;
  icon: string;
  label: string;
}

function OIDCProviderButton({
  icon,
  label: _label,
  provider,
}: OIDCProviderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOIDCLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/oidc/authorize/${provider}`, {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to initiate OIDC login");
      }

      const data = await response.json();

      // Redirect to provider's authorization endpoint
      if (data.auth_url) {
        if (typeof globalThis !== "undefined" && globalThis.window) {
          globalThis.window.location.href = data.auth_url;
        }
      }
    } catch {
      setIsLoading(false);
      // Error handled silently - user will see loading state reset
    }
  };

  return (
    <Button
      isIconOnly
      isLoading={isLoading}
      size="lg"
      variant="bordered"
      onPress={handleOIDCLogin}
    >
      <Icon icon={icon} width={20} />
    </Button>
  );
}
