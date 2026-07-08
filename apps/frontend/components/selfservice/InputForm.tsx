"use client";
import {
  Button,
  Description,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  NumberField,
  Select,
  Switch,
  TextField,
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
  const params: InputParam[] = (pageFlow.input_params ?? [])
    .slice()
    .sort((a, b) => a.order - b.order);
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
        <p className="text-sm text-muted">
          No inputs required for this workflow.
        </p>
        <Button isPending={isLoading} onPress={handleSubmit} variant="primary">
          {!isLoading && <Icon icon="hugeicons:rocket-02" width={16} />}
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
                onChange={(v) => setValue(param.name, v)}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>
                  {label}
                  {isRequired && <span className="text-danger ml-0.5">*</span>}
                </Switch.Content>
              </Switch>
              {description && (
                <p className="text-xs text-muted mt-0.5 ml-1">{description}</p>
              )}
            </div>
          );
        }
        if (param.type === "number") {
          return (
            <NumberField
              key={param.id}
              isRequired={isRequired}
              value={values[param.name] as number}
              onChange={(v) => setValue(param.name, v)}
            >
              <Label>{label}</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
              <Description>{description}</Description>
            </NumberField>
          );
        }
        if (param.type === "select") {
          return (
            <Select
              key={param.id}
              isRequired={isRequired}
              selectedKey={values[param.name] as string}
              onSelectionChange={(keys) => setValue(param.name, keys as string)}
            >
              <Label>{label}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {(param.options ?? []).map((opt) => (
                    <ListBox.Item key={opt.key} id={opt.key}>
                      {opt.value}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
              <Description>{description}</Description>
            </Select>
          );
        }
        if (param.type === "textarea") {
          return (
            <TextField
              key={param.id}
              isRequired={isRequired}
              value={values[param.name] as string}
              onChange={(v) => setValue(param.name, v)}
            >
              <Label>{label}</Label>
              <InputGroup.TextArea />
              <Description>{description}</Description>
            </TextField>
          );
        }
        // default: text
        return (
          <TextField
            key={param.id}
            isRequired={isRequired}
            value={values[param.name] as string}
            onChange={(v) => setValue(param.name, v)}
          >
            <Label>{label}</Label>
            <InputGroup>
              <InputGroup.Input key={param.id} />
            </InputGroup>
            <Description>{description}</Description>
          </TextField>
        );
      })}

      <Button
        className="w-full mt-2"
        isPending={isLoading}
        onPress={handleSubmit}
        variant="primary"
      >
        {!isLoading && <Icon icon="hugeicons:rocket-02" width={16} />}
        Run Workflow
      </Button>
    </div>
  );
}
