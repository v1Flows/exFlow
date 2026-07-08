"use client";
import {
  Button,
  Description,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
  toast,
  Tooltip,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import React, {
  FormEvent,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { IconWrapper } from "@/lib/IconWrapper";
import CheckUserTaken from "@/lib/auth/checkTaken";
import AdminCreateUser from "@/lib/fetch/admin/POST/CreateUser";
export default function AdminCreateUserModal({
  disclosure,
}: {
  disclosure: UseOverlayStateReturn;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = React.useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [[page, direction], setPage] = useState([0, 0]);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const handleSelectRole = (e: any) => {
    setRole(e);
  };
  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  const Title = useCallback(
    (props: PropsWithChildren<{}>) => (
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
  const titleContent = useMemo(() => {
    return page === 0
      ? "Create User"
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
    const res = await AdminCreateUser(email, username, password, role);
    if (res.result === "success") {
      setIsLoading(false);
      onOpenChange(false);
      toast.success("User Created", {
        description: "User created successfully",
      });
      router.refresh();
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsPasswordVisible(false);
      setIsConfirmPasswordVisible(false);
      paginate(0);
      setError(false);
      setErrorText("");
      setIsUsernameValid(true);
      setIsEmailValid(true);
      setIsPasswordValid(true);
      setIsConfirmPasswordValid(true);
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      toast.danger("User Creation Failed", { description: res.error });
    }
  };
  // eslint-disable-next-line no-undef
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
    <main>
      <Modal>
        <Modal.Backdrop
          isDismissable={false}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center">
            <Modal.Dialog>
              <div className="flex size-full items-center justify-center">
                <div className="flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-lg bg-transparent px-8 pb-10 pt-6">
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
                                  onPress={() => paginate(-1)}
                                  className="aspect-square p-0"
                                >
                                  <Icon
                                    className="text-muted"
                                    icon="solar:alt-arrow-left-linear"
                                    width={16}
                                  />
                                </Button>
                              </Tooltip.Trigger>
                              <Tooltip.Content>{"Go back"}</Tooltip.Content>
                            </Tooltip>
                          </m.div>
                        )}
                      </AnimatePresence>
                      <m.div className="flex flex-col gap-4">
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
                            <div className="flex items-center gap-2">
                              <IconWrapper className="bg-danger/10 text-danger">
                                <Icon icon="hugeicons:information-circle" />
                              </IconWrapper>
                              <p className="text-md font-bold capitalize text-danger">
                                {errorText}
                              </p>
                            </div>
                          </AnimatePresence>
                        )}
                      </m.div>
                    </m.div>
                    <AnimatePresence
                      custom={direction}
                      initial={false}
                      mode="wait"
                    >
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
                            <TextField
                              isRequired
                              name="username"
                              value={username}
                              onChange={(value) => {
                                setIsUsernameValid(true);
                                setUsername(value);
                              }}
                            >
                              <Label>{"Username"}</Label>
                              <InputGroup>
                                <InputGroup.Input type="username" />
                              </InputGroup>
                            </TextField>
                            <TextField
                              isRequired
                              name="email"
                              value={email}
                              onChange={(value) => {
                                setIsEmailValid(true);
                                setEmail(value);
                              }}
                            >
                              <Label>{"Email Address"}</Label>
                              <InputGroup>
                                <InputGroup.Input type="email" />
                              </InputGroup>
                            </TextField>
                            <Select
                              isRequired
                              className="max-w-xs"
                              selectedKey={role}
                              onSelectionChange={handleSelectRole}
                            >
                              <Label>{"Role"}</Label>
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  <ListBox.Item
                                    key="user"
                                    id="user"
                                    textValue="User"
                                  >
                                    User
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                  <ListBox.Item
                                    key="editor"
                                    id="editor"
                                    textValue="Editor"
                                  >
                                    Editor
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                  <ListBox.Item
                                    key="admin"
                                    id="admin"
                                    textValue="Admin"
                                  >
                                    Admin
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                </ListBox>
                              </Select.Popover>
                            </Select>
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
                              <InputGroup.Input
                                type={isPasswordVisible ? "text" : "password"}
                              />
                              <InputGroup.Suffix>
                                {
                                  <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                  >
                                    {isPasswordVisible ? (
                                      <Icon
                                        className="pointer-events-none text-2xl text-muted"
                                        icon="solar:eye-closed-linear"
                                      />
                                    ) : (
                                      <Icon
                                        className="pointer-events-none text-2xl text-muted"
                                        icon="solar:eye-bold"
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
                              <InputGroup.Input
                                type={
                                  isConfirmPasswordVisible ? "text" : "password"
                                }
                              />
                              <InputGroup.Suffix>
                                {
                                  <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                  >
                                    {isConfirmPasswordVisible ? (
                                      <Icon
                                        className="pointer-events-none text-2xl text-muted"
                                        icon="solar:eye-closed-linear"
                                      />
                                    ) : (
                                      <Icon
                                        className="pointer-events-none text-2xl text-muted"
                                        icon="solar:eye-bold"
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
                          isPending={isLoading}
                          type="submit"
                          variant="primary"
                          className="w-full"
                        >
                          {page === 0
                            ? "Continue with Email"
                            : page === 1
                              ? "Enter Password"
                              : "Confirm Password"}
                        </Button>
                      </m.form>
                    </AnimatePresence>
                  </LazyMotion>
                </div>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}
