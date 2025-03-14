"use client";

import { Icon } from "@iconify/react";
import {
  Button,
  Image,
  Input,
  Link,
  Tooltip,
  Alert,
  addToast,
} from "@heroui/react";
import { useIsSSR } from "@react-aria/ssr";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React from "react";

import { setSession } from "@/lib/setSession";
import SignUpAPI from "@/lib/auth/signup";
import LoginAPI from "@/lib/auth/login";
import CheckUserTaken from "@/lib/auth/checkTaken";

import Particles from "../magicui/particles";

export default function SignUpPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isSSR = useIsSSR();

  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [[page, direction], setPage] = React.useState([0, 0]);
  const [isUsernameValid, setIsUsernameValid] = React.useState(true);
  const [isEmailValid, setIsEmailValid] = React.useState(true);
  const [isPasswordValid, setIsPasswordValid] = React.useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] =
    React.useState(true);

  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const Title = React.useCallback(
    (props: React.PropsWithChildren<{}>) => (
      <m.h1
        animate={{ opacity: 1, x: 0 }}
        className="text-xl font-medium"
        exit={{ opacity: 0, x: -10 }}
        initial={{ opacity: 0, x: -10 }}
      >
        {props.children}
      </m.h1>
    ),
    [page],
  );

  const titleContent = React.useMemo(() => {
    return page === 0
      ? "Sign Up"
      : page === 1
        ? "Enter Password"
        : "Confirm Password";
  }, [page]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleEmailSubmit = async () => {
    if (!email.length) {
      setIsEmailValid(false);

      return;
    }
    if (!username.length) {
      setIsUsernameValid(false);

      return;
    }

    const res = await CheckUserTaken(email, username);

    if (res.result === "success") {
      setError(false);
      setErrorText("");
      setIsUsernameValid(true);
      setIsEmailValid(true);
      paginate(1);
    } else {
      setError(true);
      setErrorText(res.error);
      setIsUsernameValid(res.error !== "Username already taken");
      setIsEmailValid(res.error !== "Email already taken");
    }
  };

  const handlePasswordSubmit = () => {
    if (!password.length) {
      setIsPasswordValid(false);

      return;
    }
    setIsPasswordValid(true);
    paginate(1);
  };

  const handleConfirmPasswordSubmit = async () => {
    if (!confirmPassword.length || confirmPassword !== password) {
      setIsConfirmPasswordValid(false);

      return;
    }
    setIsConfirmPasswordValid(true);

    setIsLoading(true);
    const res = await SignUpAPI(email, username, password);

    if (res.result === "success") {
      // login
      const loginRes = await LoginAPI(email, password, false);

      if (!loginRes.error) {
        await setSession(loginRes.token, loginRes.user, loginRes.expires_at);

        setIsLoading(false);
        router.push("/");
        addToast({
          title: "Sign Up",
          description: "Successfully signed up and logged in!",
          color: "success",
          variant: "flat",
        });
      } else {
        addToast({
          title: "Sign Up",
          description: loginRes.error,
          color: "danger",
          variant: "flat",
        });
      }
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      addToast({
        title: "Sign Up",
        description: res.error,
        color: "danger",
        variant: "flat",
      });
    }
  };

  // eslint-disable-next-line no-undef
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    switch (page) {
      case 0:
        handleEmailSubmit();
        break;
      case 1:
        handlePasswordSubmit();
        break;
      case 2:
        handleConfirmPasswordSubmit();
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex size-full flex-col items-center justify-center">
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
          height={32}
          radius="none"
          shadow="none"
          src={`/images/af_logo_${theme === "light" || isSSR ? "black" : "white"}.png`}
          width={32}
        />
        <p className="text-xl font-medium">Welcome</p>
        <p className="text-small text-default-500">
          Create your account to get started
        </p>
      </div>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 py-6 shadow-small">
        <LazyMotion features={domAnimation}>
          <m.div className="flex min-h-[40px] items-center gap-2 pb-2">
            <AnimatePresence initial={false} mode="popLayout">
              {page >= 1 && (
                <m.div
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  initial={{ opacity: 0, x: -10 }}
                >
                  <Tooltip content="Go back" delay={3000}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={() => paginate(-1)}
                    >
                      <Icon
                        className="text-default-500"
                        icon="solar:alt-arrow-left-linear"
                        width={16}
                      />
                    </Button>
                  </Tooltip>
                </m.div>
              )}
            </AnimatePresence>
            <m.div className="flex flex-col gap-4">
              <AnimatePresence custom={direction} initial={false} mode="wait">
                <Title>{titleContent}</Title>
              </AnimatePresence>
              {error && (
                <AnimatePresence custom={direction} initial={false} mode="wait">
                  <Alert color="danger" description={errorText} title="Error" />
                </AnimatePresence>
              )}
            </m.div>
          </m.div>
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <m.form
              key={page}
              animate="center"
              className="flex flex-col gap-3"
              custom={direction}
              exit="exit"
              initial="enter"
              transition={{ duration: 0.2 }}
              variants={variants}
              onSubmit={handleSubmit}
            >
              {page === 0 && (
                <>
                  <Input
                    isRequired
                    label="Username"
                    name="username"
                    type="username"
                    validationState={isUsernameValid ? "valid" : "invalid"}
                    value={username}
                    onValueChange={(value) => {
                      setIsUsernameValid(true);
                      setUsername(value);
                    }}
                  />
                  <Input
                    isRequired
                    label="Email Address"
                    name="email"
                    type="email"
                    validationState={isEmailValid ? "valid" : "invalid"}
                    value={email}
                    onValueChange={(value) => {
                      setIsEmailValid(true);
                      setEmail(value);
                    }}
                  />
                </>
              )}
              {page === 1 && (
                <Input
                  isRequired
                  endContent={
                    <button type="button" onClick={togglePasswordVisibility}>
                      {isPasswordVisible ? (
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
                  type={isPasswordVisible ? "text" : "password"}
                  validationState={isPasswordValid ? "valid" : "invalid"}
                  value={password}
                  onValueChange={(value) => {
                    setIsPasswordValid(true);
                    setPassword(value);
                  }}
                />
              )}
              {page === 2 && (
                <Input
                  isRequired
                  endContent={
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {isConfirmPasswordVisible ? (
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
                  errorMessage={
                    !isConfirmPasswordValid
                      ? "Passwords do not match"
                      : undefined
                  }
                  label="Confirm Password"
                  name="confirmPassword"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  validationState={isConfirmPasswordValid ? "valid" : "invalid"}
                  value={confirmPassword}
                  onValueChange={(value) => {
                    setIsConfirmPasswordValid(true);
                    setConfirmPassword(value);
                  }}
                />
              )}
              <Button
                fullWidth
                color="primary"
                isLoading={isLoading}
                type="submit"
              >
                {page === 0
                  ? "Continue with Email"
                  : page === 1
                    ? "Enter Password"
                    : "Confirm Password & Sign Up"}
              </Button>
            </m.form>
          </AnimatePresence>
        </LazyMotion>
        <p className="text-center text-small">
          Already have an account?&nbsp;
          <Link href="/auth/login" size="sm">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
