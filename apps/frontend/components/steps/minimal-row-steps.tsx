"use client";
import type { ComponentProps } from "react";

import { useControlledState } from "@react-stately/utils";
import { domAnimation, LazyMotion, m } from "framer-motion";
import React from "react";

import { cn } from "@/components/cn/cn";

export type MinimalRowStepsProps = {
  /**
   * The label of the steps.
   */
  label?: string;
  /**
   * Length of the steps.
   *
   * @default 3
   */
  stepsCount?: number;
  /**
   * The color of the steps.
   *
   * @default "primary"
   */
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "default";
  /**
   * The current step index.
   */
  currentStep?: number;
  /**
   * The default step index.
   *
   * @default 0
   */
  defaultStep?: number;
  /**
   * Whether to hide the progress bars.
   *
   * @default false
   */
  hideProgressBars?: boolean;
  /**
   * The custom class for the steps wrapper.
   */
  className?: string;
  /**
   * The custom class for the step.
   */
  stepClassName?: string;
  /**
   * Callback function when the step index changes.
   */
  onStepChange?: (stepIndex: number) => void;
  // eslint-disable-next-line no-undef
} & React.HTMLAttributes<HTMLButtonElement>;

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <m.path
        animate={{ pathLength: 1 }}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
      />
    </svg>
  );
}

const MinimalRowSteps = ({
  ref,
  color = "primary",
  stepsCount = 3,
  defaultStep = 0,
  label,
  onStepChange,
  currentStep: currentStepProp,
  hideProgressBars = false,
  stepClassName,
  className,
  ...props
  // eslint-disable-next-line no-undef
}: MinimalRowStepsProps & { ref: React.RefObject<HTMLButtonElement> }) => {
  const [currentStep, setCurrentStep] = useControlledState(
    currentStepProp,
    defaultStep,
    onStepChange,
  );

  const colors = React.useMemo(() => {
    let userColor;
    let fgColor;

    const colorsVars = [
      "[--active-fg-color:var(--step-fg-color)]",
      "[--active-border-color:var(--step-color)]",
      "[--active-color:var(--step-color)]",
      "[--complete-background-color:var(--step-color)]",
      "[--complete-border-color:var(--step-color)]",
      "[--inactive-border-color:var(--border)]",
      "[--inactive-color:var(--muted)]",
    ];

    switch (color) {
      case "primary":
        userColor = "[--step-color:var(--accent)]";
        fgColor = "[--step-fg-color:var(--accent-foreground)]";
        break;
      case "secondary":
        userColor = "[--step-color:var(--accent)]";
        fgColor = "[--step-fg-color:var(--accent-foreground)]";
        break;
      case "success":
        userColor = "[--step-color:var(--success)]";
        fgColor = "[--step-fg-color:var(--success-foreground)]";
        break;
      case "warning":
        userColor = "[--step-color:var(--warning)]";
        fgColor = "[--step-fg-color:var(--warning-foreground)]";
        break;
      case "danger":
        userColor = "[--step-color:var(--danger)]";
        fgColor = "[--step-fg-color:var(--danger-foreground)]";
        break;
      case "default":
        userColor = "[--step-color:var(--default)]";
        fgColor = "[--step-fg-color:var(--default-foreground)]";
        break;
      default:
        userColor = "[--step-color:var(--accent)]";
        fgColor = "[--step-fg-color:var(--accent-foreground)]";
        break;
    }

    colorsVars.unshift(fgColor);
    colorsVars.unshift(userColor);

    return colorsVars;
  }, [color]);

  return (
    <nav aria-label="Progress" className="flex max-w-fit items-center">
      {label && (
        <label className="w-28 text-sm font-medium text-default-foreground lg:text-base">
          {label}
        </label>
      )}
      <ol
        className={cn(
          "flex flex-row flex-nowrap gap-x-3 overflow-x-scroll ",
          colors,
          className,
        )}
      >
        {Array.from({ length: stepsCount })?.map((_, stepIdx) => {
          const status =
            currentStep === stepIdx
              ? "active"
              : currentStep < stepIdx
                ? "inactive"
                : "complete";

          return (
            <li
              key={stepIdx}
              className="relative flex w-full items-center pr-12"
            >
              <button
                key={stepIdx}
                ref={ref}
                aria-current={status === "active" ? "step" : undefined}
                className={cn(
                  "group flex w-full cursor-pointer flex-row items-center justify-center gap-x-3 rounded-lg py-2.5",
                  stepClassName,
                )}
                onClick={() => setCurrentStep(stepIdx)}
                {...props}
              >
                <div className="h-ful relative flex items-center">
                  <LazyMotion features={domAnimation}>
                    <m.div animate={status} className="relative">
                      <m.div
                        className={cn(
                          "relative flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 text-lg font-semibold text-default-foreground",
                          {
                            "shadow-lg": status === "complete",
                          },
                        )}
                        initial={false}
                        transition={{ duration: 0.25 }}
                        variants={{
                          inactive: {
                            backgroundColor: "transparent",
                            borderColor: "var(--inactive-border-color)",
                            color: "var(--inactive-color)",
                          },
                          active: {
                            backgroundColor: "transparent",
                            borderColor: "var(--active-border-color)",
                            color: "var(--active-color)",
                          },
                          complete: {
                            backgroundColor: "var(--complete-background-color)",
                            borderColor: "var(--complete-border-color)",
                          },
                        }}
                      >
                        <div className="flex items-center justify-center">
                          {status === "complete" ? (
                            <CheckIcon className="size-5 text-(--active-fg-color)" />
                          ) : (
                            <span />
                          )}
                        </div>
                      </m.div>
                    </m.div>
                  </LazyMotion>
                </div>
                {stepIdx < stepsCount - 1 && !hideProgressBars && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 left-[26px] w-[calc(100%-13px)] flex-none items-center"
                    style={{
                      // @ts-ignore
                      "--idx": stepIdx,
                    }}
                  >
                    <div
                      className={cn(
                        "relative h-0.5 w-full bg-default transition-colors duration-300",
                        "after:absolute after:block after:h-full after:w-0 after:bg-(--active-border-color) after:transition-[width] after:duration-300 after:content-['']",
                        {
                          "after:w-full": stepIdx < currentStep,
                        },
                      )}
                    />
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

MinimalRowSteps.displayName = "MinimalRowSteps";

export default MinimalRowSteps;
