"use client";
import { Icon } from "@iconify/react";
import {
  Alert,
  Button,
  Card,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  Link,
  TextField,
  toast,
  Tooltip,
} from "@heroui/react";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import { setSession } from "@/lib/setSession";
import SignUpAPI from "@/lib/auth/signup";
import LoginAPI from "@/lib/auth/login";
import CheckUserTaken from "@/lib/auth/checkTaken";
import { Ripple } from "../magicui/ripple";
export default function SignUpPage({ settings }: any) {
  const router = useRouter();
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
    const res = await CheckUserTaken(null, email, username);
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
        toast.success("Sign Up", {
          description: "Successfully signed up and logged in!",
        });
      } else {
        toast.danger("Sign Up", { description: loginRes.error });
      }
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      toast.danger("Sign Up", { description: res.error });
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-accent/10 ring-1 ring-accent/20">
            <Icon
              className="text-3xl text-accent"
              icon="hugeicons:user-add-01"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Create <span className="text-accent">Account</span>
          </h1>
          <p className="text-gray-400 text-lg">Join JustFlow to get started</p>
        </div>

        <Card className="w-full border-none shadow-2xl bg-surface/60 backdrop-blur-md">
          <Card.Content className="px-8 py-8 space-y-6">
            <LazyMotion features={domAnimation}>
              <m.div className="flex min-h-[40px] items-center gap-2 pb-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {page >= 1 && (
                    <m.div
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      initial={{ opacity: 0, x: -10 }}
                    >
                      <Tooltip>
                        <Tooltip.Trigger>
                          <Button
                            size="sm"
                            variant="tertiary"
                            onPress={() => paginate(-1)}
                            className="aspect-square p-0"
                          >
                            <Icon
                              className="text-muted"
                              icon="hugeicons:arrow-left-01"
                              width={16}
                            />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{"Go back"}</Tooltip.Content>
                      </Tooltip>
                    </m.div>
                  )}
                </AnimatePresence>
                <m.div className="flex flex-col gap-4 w-full">
                  <AnimatePresence
                    custom={direction}
                    initial={false}
                    mode="wait"
                  >
                    <Title>{titleContent}</Title>
                  </AnimatePresence>
                  {error && (
                    <AnimatePresence
                      custom={direction}
                      initial={false}
                      mode="wait"
                    >
                      <Alert status={"danger"}>
                        <Alert.Indicator></Alert.Indicator>
                        <Alert.Content>
                          <Alert.Title>{"Error"}</Alert.Title>
                          <Alert.Description>{errorText}</Alert.Description>
                        </Alert.Content>
                      </Alert>
                    </AnimatePresence>
                  )}
                  {!settings.signup && (
                    <Alert status={"danger"}>
                      <Alert.Indicator></Alert.Indicator>
                      <Alert.Content>
                        <Alert.Title>{"Sign Up Disabled"}</Alert.Title>
                        <Alert.Description>
                          {
                            "Sign up is currently disabled. Please check back later."
                          }
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}
                </m.div>
              </m.div>
              <AnimatePresence custom={direction} initial={false} mode="wait">
                <m.form
                  key={page}
                  animate="center"
                  className="flex flex-col gap-4"
                  custom={direction}
                  exit="exit"
                  initial="enter"
                  transition={{ duration: 0.2 }}
                  variants={variants}
                  onSubmit={handleSubmit}
                >
                  {page === 0 && (
                    <>
                      <TextField
                        isRequired
                        isDisabled={!settings.signup}
                        name="username"
                        value={username}
                        onChange={(value) => {
                          setIsUsernameValid(true);
                          setUsername(value);
                        }}
                      >
                        <Label>{"Username"}</Label>
                        <InputGroup>
                          <Input type="username" />
                        </InputGroup>
                      </TextField>
                      <TextField
                        isRequired
                        isDisabled={!settings.signup}
                        name="email"
                        value={email}
                        onChange={(value) => {
                          setIsEmailValid(true);
                          setEmail(value);
                        }}
                      >
                        <Label>{"Email Address"}</Label>
                        <InputGroup>
                          <Input type="email" />
                        </InputGroup>
                      </TextField>
                    </>
                  )}
                  {page === 1 && (
                    <TextField
                      isRequired
                      name="password"
                      value={password}
                      onChange={(value) => {
                        setIsPasswordValid(true);
                        setPassword(value);
                      }}
                    >
                      <Label>{"Password"}</Label>
                      <InputGroup>
                        <Input type={isPasswordVisible ? "text" : "password"} />
                        <InputGroup.Suffix>
                          {
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                            >
                              {isPasswordVisible ? (
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
                  )}
                  {page === 2 && (
                    <TextField
                      isRequired
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(value) => {
                        setIsConfirmPasswordValid(true);
                        setConfirmPassword(value);
                      }}
                    >
                      <Label>{"Confirm Password"}</Label>
                      <InputGroup>
                        <Input
                          type={isConfirmPasswordVisible ? "text" : "password"}
                        />
                        <InputGroup.Suffix>
                          {
                            <button
                              type="button"
                              onClick={toggleConfirmPasswordVisibility}
                            >
                              {isConfirmPasswordVisible ? (
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
                      <FieldError>
                        {!isConfirmPasswordValid
                          ? "Passwords do not match"
                          : undefined}
                      </FieldError>
                    </TextField>
                  )}
                  <Button
                    className="font-bold shadow-lg shadow-accent/20"
                    isDisabled={isLoading || !settings.signup}
                    isPending={isLoading}
                    type="submit"
                    variant="primary"
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
            <p className="text-center text-sm">
              Already have an account?&nbsp;
              <Link href="/auth/login">Log In</Link>
            </p>
          </Card.Content>
        </Card>
      </div>
      <Ripple mainCircleOpacity={0.15} numCircles={8} />
    </main>
  );
}
