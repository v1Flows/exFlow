"use client";
import {
  Button,
  Card,
  Description,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  Separator,
  Switch,
  TextField,
  toast,
  useOverlayState,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import UpdateFlowInputParams from "@/lib/fetch/flow/PUT/UpdateFlowInputParams";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import { InputParam, InputParamOption, InputParamType } from "@/types";
const PARAM_TYPES: {
  key: InputParamType;
  label: string;
}[] = [
  { key: "text", label: "Text" },
  { key: "textarea", label: "Text Area" },
  { key: "number", label: "Number" },
  { key: "boolean", label: "Boolean (Toggle)" },
  { key: "select", label: "Select (Dropdown)" },
];
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}
function emptyParam(): InputParam {
  return {
    id: generateId(),
    name: "",
    label: "",
    description: "",
    type: "text",
    required: false,
    default: "",
    options: [],
    order: 0,
  };
}
export default function FlowInputParams({
  flow,
  canEdit,
}: {
  flow: any;
  canEdit: boolean;
}) {
  const { refreshFlowData } = useRefreshCache();
  const [params, setParams] = useState<InputParam[]>(
    (flow.input_params as InputParam[]) ?? [],
  );
  const [editingParam, setEditingParam] = useState<InputParam | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { isOpen, open: onOpen, setOpen: onOpenChange } = useOverlayState();
  function openNew() {
    setEditingParam(emptyParam());
    setEditingIndex(null);
    onOpen();
  }
  function openEdit(param: InputParam, index: number) {
    setEditingParam({ ...param });
    setEditingIndex(index);
    onOpen();
  }
  function saveParam(onClose: () => void) {
    if (!editingParam) return;
    if (!editingParam.name.trim() || !editingParam.label.trim()) {
      toast.warning("Validation", {
        description: "Name and Label are required.",
      });
      return;
    }
    const updated = [...params];
    if (editingIndex === null) {
      updated.push({ ...editingParam, order: updated.length });
    } else {
      updated[editingIndex] = editingParam;
    }
    setParams(updated);
    onClose();
  }
  function removeParam(index: number) {
    setParams((prev) => prev.filter((_, i) => i !== index));
  }
  function moveParam(index: number, direction: -1 | 1) {
    const updated = [...params];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setParams(updated.map((p, i) => ({ ...p, order: i })));
  }
  async function saveAll() {
    setSaving(true);
    const ordered = params.map((p, i) => ({ ...p, order: i }));
    const response = await UpdateFlowInputParams(flow.id, ordered);
    setSaving(false);
    if (response.success) {
      refreshFlowData(flow.id);
      toast.success("Input Parameters", { description: "Saved successfully." });
    } else {
      toast.danger("Input Parameters", {
        description: "message" in response ? response.message : "",
      });
    }
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  return (
    <motion.div
      animate="visible"
      className="space-y-4 mt-4"
      initial="hidden"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm">
          <Card.Header className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Icon icon="hugeicons:form-01" width={24} />
              </div>
              <div>
                <p className="text-md font-bold">Input Parameters</p>
                <p className="text-sm text-muted">
                  Define inputs that users fill in when triggering this flow
                  from a self-service page.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button onPress={openNew} variant="primary">
                  {<Icon icon="hugeicons:add-01" width={16} />}
                  Add Parameter
                </Button>
              )}
              {canEdit && (
                <Button isPending={saving} onPress={saveAll}>
                  {!saving && <Icon icon="hugeicons:floppy-disk" width={16} />}
                  Save
                </Button>
              )}
            </div>
          </Card.Header>
          <Separator />
          <Card.Content className="gap-3">
            {params.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted">
                <Icon icon="hugeicons:form-01" width={48} />
                <p className="mt-3 text-sm">No input parameters defined.</p>
                {canEdit && (
                  <p className="text-xs mt-1">
                    Click &quot;Add Parameter&quot; to get started.
                  </p>
                )}
              </div>
            )}
            {params.map((param, index) => (
              <motion.div key={param.id} variants={itemVariants}>
                <Card className="bg-surface-secondary/40 border border-default">
                  <Card.Content className="flex flex-row items-center gap-3 py-3">
                    <div className="flex flex-col gap-1 mr-1">
                      <Button
                        isDisabled={!canEdit || index === 0}
                        variant="ghost"
                        onPress={() => moveParam(index, -1)}
                        className="aspect-square p-0"
                      >
                        <Icon icon="hugeicons:arrow-up-01" width={14} />
                      </Button>
                      <Button
                        isDisabled={!canEdit || index === params.length - 1}
                        variant="ghost"
                        onPress={() => moveParam(index, 1)}
                        className="aspect-square p-0"
                      >
                        <Icon icon="hugeicons:arrow-down-01" width={14} />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {param.label}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {param.name}
                        </span>
                        <span className="text-xs bg-default rounded px-1.5 py-0.5">
                          {param.type}
                        </span>
                        {param.required && (
                          <span className="text-xs bg-danger/10 text-danger rounded px-1.5 py-0.5">
                            required
                          </span>
                        )}
                      </div>
                      {param.description && (
                        <p className="text-xs text-muted mt-0.5 truncate">
                          {param.description}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          onPress={() => openEdit(param, index)}
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:pencil-edit-02" width={16} />
                        </Button>
                        <Button
                          variant="danger"
                          onPress={() => removeParam(index)}
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:delete-02" width={16} />
                        </Button>
                      </div>
                    )}
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </Card.Content>
        </Card>
      </motion.div>

      {/* Edit / Add Modal */}
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container size="lg">
            <Modal.Dialog>
              {({ close: onClose }) => (
                <>
                  <Modal.Header>
                    <Modal.Heading>
                      {editingIndex === null
                        ? "Add Parameter"
                        : "Edit Parameter"}
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className="gap-4">
                    {editingParam && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <TextField
                            value={editingParam.name}
                            onChange={(v) =>
                              setEditingParam({ ...editingParam, name: v })
                            }
                          >
                            <Label>{"Name (key)"}</Label>
                            <InputGroup>
                              <InputGroup.Input placeholder="e.g. target_host" />
                            </InputGroup>
                            <Description>
                              {
                                "Internal identifier (snake_case), used in action params."
                              }
                            </Description>
                          </TextField>
                          <TextField
                            value={editingParam.label}
                            onChange={(v) =>
                              setEditingParam({ ...editingParam, label: v })
                            }
                          >
                            <Label>{"Label"}</Label>
                            <InputGroup>
                              <InputGroup.Input placeholder="e.g. Target Host" />
                            </InputGroup>
                            <Description>
                              {"Displayed to the user on the form."}
                            </Description>
                          </TextField>
                        </div>
                        <TextField
                          value={editingParam.description}
                          onChange={(v) =>
                            setEditingParam({ ...editingParam, description: v })
                          }
                        >
                          <Label>{"Description"}</Label>
                          <InputGroup>
                            <InputGroup.Input placeholder="Brief explanation shown below the field" />
                          </InputGroup>
                        </TextField>
                        <div className="grid grid-cols-2 gap-3">
                          <Select
                            selectedKey={editingParam.type}
                            onSelectionChange={(keys) =>
                              setEditingParam({
                                ...editingParam,
                                type: keys as InputParamType,
                              })
                            }
                          >
                            <Label>{"Type"}</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {PARAM_TYPES.map((t) => (
                                  <ListBox.Item key={t.key} id={t.key}>
                                    {t.label}
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                          <TextField
                            value={editingParam.default}
                            onChange={(v) =>
                              setEditingParam({ ...editingParam, default: v })
                            }
                          >
                            <Label>{"Default Value"}</Label>
                            <InputGroup>
                              <InputGroup.Input placeholder="Optional default" />
                            </InputGroup>
                          </TextField>
                        </div>
                        <Switch
                          isSelected={editingParam.required}
                          onChange={(v) =>
                            setEditingParam({ ...editingParam, required: v })
                          }
                        >
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Switch.Content>Required</Switch.Content>
                        </Switch>
                        {editingParam.type === "select" && (
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Options{" "}
                              <span className="text-muted text-xs">
                                (key=value pairs)
                              </span>
                            </p>
                            <div className="space-y-2">
                              {(editingParam.options ?? []).map((opt, oi) => (
                                <div
                                  key={oi}
                                  className="flex gap-2 items-center"
                                >
                                  <TextField
                                    value={opt.key}
                                    onChange={(v) => {
                                      const opts = [
                                        ...(editingParam.options ?? []),
                                      ];
                                      opts[oi] = { ...opts[oi], key: v };
                                      setEditingParam({
                                        ...editingParam,
                                        options: opts,
                                      });
                                    }}
                                  >
                                    <InputGroup>
                                      <InputGroup.Input placeholder="key" />
                                    </InputGroup>
                                  </TextField>
                                  <TextField
                                    value={opt.value}
                                    onChange={(v) => {
                                      const opts = [
                                        ...(editingParam.options ?? []),
                                      ];
                                      opts[oi] = { ...opts[oi], value: v };
                                      setEditingParam({
                                        ...editingParam,
                                        options: opts,
                                      });
                                    }}
                                  >
                                    <InputGroup>
                                      <InputGroup.Input placeholder="display label" />
                                    </InputGroup>
                                  </TextField>
                                  <Button
                                    variant="danger"
                                    onPress={() => {
                                      const opts = (
                                        editingParam.options ?? []
                                      ).filter((_, i) => i !== oi);
                                      setEditingParam({
                                        ...editingParam,
                                        options: opts,
                                      });
                                    }}
                                    className="aspect-square p-0"
                                  >
                                    <Icon
                                      icon="hugeicons:delete-02"
                                      width={14}
                                    />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                onPress={() =>
                                  setEditingParam({
                                    ...editingParam,
                                    options: [
                                      ...(editingParam.options ?? []),
                                      {
                                        key: "",
                                        value: "",
                                      } as InputParamOption,
                                    ],
                                  })
                                }
                              >
                                {<Icon icon="hugeicons:add-01" width={14} />}
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button onPress={onClose}>Cancel</Button>
                    <Button
                      onPress={() => saveParam(onClose)}
                      variant="primary"
                    >
                      {editingIndex === null ? "Add" : "Save"}
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </motion.div>
  );
}
