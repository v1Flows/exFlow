"use client";

import { Icon } from "@iconify/react";
import { Card, Chip } from "@heroui/react";
import { domAnimation, LazyMotion, m } from "framer-motion";
import React from "react";

type AuthLayoutProps = {
  accent: string;
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  icon: string;
  mode: "login" | "signup";
  title: string;
};

const workflowSteps = [
  {
    icon: "hugeicons:workflow-square-01",
    label: "Trigger",
    text: "A request starts the flow",
  },
  {
    icon: "hugeicons:settings-02",
    label: "Action",
    text: "Tasks run with context",
  },
  {
    icon: "hugeicons:checkmark-circle-02",
    label: "Result",
    text: "Every step is tracked",
  },
];

function AuthWorkflowVisual({ mode }: { mode: AuthLayoutProps["mode"] }) {
  const headline =
    mode === "login"
      ? "Resume your automation cockpit"
      : "Build your first workflow in minutes";

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden rounded-4xl border border-default bg-surface/40 p-6 shadow-2xl backdrop-blur-md lg:min-h-[620px] lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--accent-soft),transparent_34%),radial-gradient(circle_at_80%_0%,var(--surface-secondary),transparent_28%)]" />
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full border border-accent/20" />
        <div className="absolute bottom-12 right-12 h-56 w-56 rounded-full border border-default/70" />

        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 grid w-full max-w-3xl gap-8"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="max-w-xl space-y-4">
            <Chip variant="secondary">
              <Chip.Label>JustFlow Auth</Chip.Label>
            </Chip>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                {headline}
              </h1>
              <p className="text-base leading-relaxed text-muted md:text-lg">
                Sign in, pick up running executions, and keep your DAGs,
                runners, alerts, and project automations in one focused place.
              </p>
            </div>
          </div>

          <div className="relative min-h-[260px]">
            <svg
              aria-hidden="true"
              className="absolute inset-x-8 top-20 hidden h-28 text-accent/40 md:block"
              fill="none"
              viewBox="0 0 620 120"
            >
              <path
                d="M20 60 C150 0 210 120 310 60 S480 20 600 60"
                stroke="currentColor"
                strokeDasharray="8 10"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>

            <m.div
              animate={{ x: ["0%", "92%", "0%"], opacity: [0.25, 1, 0.25] }}
              className="absolute left-12 top-[72px] hidden h-3 w-3 rounded-full bg-accent shadow-lg shadow-accent/50 md:block"
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />

            <div className="grid gap-4 md:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <m.div
                  key={step.label}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.12 * index, duration: 0.35 }}
                >
                  <Card className="border border-default bg-surface/80 shadow-overlay backdrop-blur-md">
                    <Card.Content className="space-y-4 p-5">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/20">
                        <Icon
                          className="text-2xl text-accent"
                          icon={step.icon}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold">{step.label}</p>
                        <p className="text-sm text-muted">{step.text}</p>
                      </div>
                    </Card.Content>
                  </Card>
                </m.div>
              ))}
            </div>
          </div>

          <Card className="max-w-xl border border-default bg-surface/70 shadow-overlay backdrop-blur-md">
            <Card.Content className="grid gap-4 p-5 sm:grid-cols-3">
              {[
                ["99.9%", "tracked runs"],
                ["15+", "action plugins"],
                ["Live", "runner status"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-accent">{value}</p>
                  <p className="text-sm text-muted">{label}</p>
                </div>
              ))}
            </Card.Content>
          </Card>
        </m.div>
      </div>
    </LazyMotion>
  );
}

export default function AuthLayout({
  accent,
  children,
  description,
  eyebrow,
  icon,
  mode,
  title,
}: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,var(--accent-soft),transparent_26%),radial-gradient(circle_at_90%_20%,var(--surface-secondary),transparent_30%)]" />
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        <section className="order-2 flex items-center p-4 sm:p-6 lg:order-1 lg:p-10">
          <AuthWorkflowVisual mode={mode} />
        </section>

        <aside className="order-1 flex items-center justify-center border-b border-default bg-surface/80 p-4 backdrop-blur-xl sm:p-6 lg:order-2 lg:min-h-screen lg:border-b-0 lg:border-l lg:p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-accent/10 px-3 py-2 ring-1 ring-accent/20">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                  <Icon className="text-xl" icon={icon} />
                </span>
                <span className="text-sm font-medium text-accent">
                  {eyebrow}
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {title} <span className="text-accent">{accent}</span>
                </h1>
                <p className="text-muted">{description}</p>
              </div>
            </div>

            <Card className="border border-default bg-surface/85 shadow-2xl backdrop-blur-md">
              <Card.Content className="space-y-6 p-6 sm:p-8">
                {children}
              </Card.Content>
            </Card>
          </div>
        </aside>
      </div>
    </main>
  );
}
