"use client";

import {
  Button,
  Input,
  NumberInput,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";

import { InputParam, InputValues, PageFlow } from "@/types";

interface InputFormProps {
  pageFlow: PageFlow;
  onSubmit: (inputs: InputValues) => void;
  isLoading?: boolean;
}

export default function InputForm({
  pageFlow,
  onSubmit,
  isLoading = false,
}: InputFormProps) {
  const params: InputParam[] = (pageFlow.input_params ?? []).slice().sort(
    (a, b) => a.order - b.order,
  );

  // Apply page-level overrides / hidden flags
  const visibleParams = params.filter((param) => {
    const override = pageFlow.input_overrides?.find(
      (o) => o.input_param_id === param.id,
    );

    return !override?.hidden;
  });

  function getEffectiveDefault(param: InputParam): string {
    const override = pageFlow.input_overrides?.find(
      (o) => o.input_param_id === param.id,
    );

    return override?.default_value ?? param.default ?? "";
  }

  function getEffectiveLabel(param: InputParam): string {
    const override = pageFlow.input_overrides?.find(
      (o) => o.input_param_id === param.id,
    );

    return override?.custom_label || param.label;
  }

  function getEffectiveDescription(param: InputParam): string {
    const override = pageFlow.input_overrides?.find(
      (o) => o.input_param_id === param.id,
    );

    return override?.custom_description || param.description;
  }

  const initValues: InputValues = {};

  visibleParams.forEach((p) => {
    const def = getEffectiveDefault(p);

    if (p.type === "boolean") {
      initValues[p.name] = def === "true";
    } else if (p.type === "number") {
      initValues[p.name] = def !== "" ? Number(def) : 0;
    } else {
      initValues[p.name] = def;
    }
  });

  const [values, setValues] = useState<InputValues>(initValues);

  function setValue(name: string, value: string | number | boolean) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit() {
    onSubmit(values);
  }

  if (visibleParams.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-default-500">
          No inputs required for this workflow.
        </p>
        <Button
          color="primary"
          isLoading={isLoading}
          startContent={
            !isLoading && <Icon icon="hugeicons:rocket-02" width={16} />
          }
          onPress={handleSubmit}
        >
          Run
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleParams.map((param) => {
        const label = getEffectiveLabel(param);
        const description = getEffectiveDescription(param);
        const isRequired = param.required;

        if (param.type === "boolean") {
          return (
            <div key={param.id}>
              <Switch
                isSelected={values[param.name] as boolean}
                onValueChange={(v) => setValue(param.name, v)}
              >
                {label}
                {isRequired && (
                  <span className="text-danger ml-0.5">*</span>
                )}
              </Switch>
              {description && (
                <p className="text-tiny text-default-400 mt-0.5 ml-1">
                  {description}
                </p>
              )}
            </div>
          );
        }

        if (param.type === "number") {
          return (
            <NumberInput
              key={param.id}
              description={description}
              isRequired={isRequired}
              label={label}
              value={values[param.name] as number}
              variant="bordered"
              onValueChange={(v) => setValue(param.name, v)}
            />
          );
        }

        if (param.type === "select") {
          return (
            <Select
              key={param.id}
              description={description}
              isRequired={isRequired}
              label={label}
              selectedKeys={[values[param.name] as string]}
              variant="bordered"
              onSelectionChange={(keys) =>
                setValue(param.name, keys.currentKey as string)
              }
            >
              {(param.options ?? []).map((opt) => (
                <SelectItem key={opt.key}>{opt.value}</SelectItem>
              ))}
            </Select>
          );
        }

        if (param.type === "textarea") {
          return (
            <Textarea
              key={param.id}
              description={description}
              isRequired={isRequired}
              label={label}
              value={values[param.name] as string}
              variant="bordered"
              onValueChange={(v) => setValue(param.name, v)}
            />
          );
        }

        // default: text
        return (
          <Input
            key={param.id}
            description={description}
            isRequired={isRequired}
            label={label}
            value={values[param.name] as string}
            variant="bordered"
            onValueChange={(v) => setValue(param.name, v)}
          />
        );
      })}

      <Button
        className="w-full mt-2"
        color="primary"
        isLoading={isLoading}
        startContent={
          !isLoading && <Icon icon="hugeicons:rocket-02" width={16} />
        }
        onPress={handleSubmit}
      >
        Run Workflow
      </Button>
    </div>
  );
}
