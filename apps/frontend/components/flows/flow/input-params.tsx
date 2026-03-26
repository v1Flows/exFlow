"use client";

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import UpdateFlowInputParams from "@/lib/fetch/flow/PUT/UpdateFlowInputParams";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import { InputParam, InputParamOption, InputParamType } from "@/types";

const PARAM_TYPES: { key: InputParamType; label: string }[] = [
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
      addToast({
        title: "Validation",
        description: "Name and Label are required.",
        color: "warning",
        variant: "flat",
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
      addToast({
        title: "Input Parameters",
        description: "Saved successfully.",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Input Parameters",
        description: ("message" in response ? response.message : ""),
        color: "danger",
        variant: "flat",
      });
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div
      animate="visible"
      className="space-y-4 mt-4"
      initial="hidden"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon icon="hugeicons:form-01" width={24} />
              </div>
              <div>
                <p className="text-md font-bold">Input Parameters</p>
                <p className="text-small text-default-500">
                  Define inputs that users fill in when triggering this flow from a
                  self-service page.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  color="primary"
                  size="sm"
                  startContent={<Icon icon="hugeicons:add-01" width={16} />}
                  variant="flat"
                  onPress={openNew}
                >
                  Add Parameter
                </Button>
              )}
              {canEdit && (
                <Button
                  color="success"
                  isLoading={saving}
                  size="sm"
                  startContent={
                    !saving && <Icon icon="hugeicons:floppy-disk" width={16} />
                  }
                  variant="flat"
                  onPress={saveAll}
                >
                  Save
                </Button>
              )}
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-3">
            {params.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-default-400">
                <Icon icon="hugeicons:form-01" width={48} />
                <p className="mt-3 text-sm">No input parameters defined.</p>
                {canEdit && (
                  <p className="text-tiny mt-1">
                    Click &quot;Add Parameter&quot; to get started.
                  </p>
                )}
              </div>
            )}
            {params.map((param, index) => (
              <motion.div key={param.id} variants={itemVariants}>
                <Card className="bg-content2/40 border border-default-100">
                  <CardBody className="flex flex-row items-center gap-3 py-3">
                    <div className="flex flex-col gap-1 mr-1">
                      <Button
                        isDisabled={!canEdit || index === 0}
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => moveParam(index, -1)}
                      >
                        <Icon icon="hugeicons:arrow-up-01" width={14} />
                      </Button>
                      <Button
                        isDisabled={!canEdit || index === params.length - 1}
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => moveParam(index, 1)}
                      >
                        <Icon icon="hugeicons:arrow-down-01" width={14} />
                      </Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{param.label}</span>
                        <span className="font-mono text-tiny text-default-400">
                          {param.name}
                        </span>
                        <span className="text-tiny bg-default-100 rounded px-1.5 py-0.5">
                          {param.type}
                        </span>
                        {param.required && (
                          <span className="text-tiny bg-danger/10 text-danger rounded px-1.5 py-0.5">
                            required
                          </span>
                        )}
                      </div>
                      {param.description && (
                        <p className="text-tiny text-default-400 mt-0.5 truncate">
                          {param.description}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => openEdit(param, index)}
                        >
                          <Icon icon="hugeicons:pencil-edit-02" width={16} />
                        </Button>
                        <Button
                          color="danger"
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => removeParam(index)}
                        >
                          <Icon icon="hugeicons:delete-02" width={16} />
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </CardBody>
        </Card>
      </motion.div>

      {/* Edit / Add Modal */}
      <Modal isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingIndex === null ? "Add Parameter" : "Edit Parameter"}
              </ModalHeader>
              <ModalBody className="gap-4">
                {editingParam && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        description="Internal identifier (snake_case), used in action params."
                        label="Name (key)"
                        placeholder="e.g. target_host"
                        value={editingParam.name}
                        variant="bordered"
                        onValueChange={(v) =>
                          setEditingParam({ ...editingParam, name: v })
                        }
                      />
                      <Input
                        description="Displayed to the user on the form."
                        label="Label"
                        placeholder="e.g. Target Host"
                        value={editingParam.label}
                        variant="bordered"
                        onValueChange={(v) =>
                          setEditingParam({ ...editingParam, label: v })
                        }
                      />
                    </div>
                    <Input
                      label="Description"
                      placeholder="Brief explanation shown below the field"
                      value={editingParam.description}
                      variant="bordered"
                      onValueChange={(v) =>
                        setEditingParam({ ...editingParam, description: v })
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Type"
                        selectedKeys={[editingParam.type]}
                        variant="bordered"
                        onSelectionChange={(keys) =>
                          setEditingParam({
                            ...editingParam,
                            type: keys.currentKey as InputParamType,
                          })
                        }
                      >
                        {PARAM_TYPES.map((t) => (
                          <SelectItem key={t.key}>{t.label}</SelectItem>
                        ))}
                      </Select>
                      <Input
                        label="Default Value"
                        placeholder="Optional default"
                        value={editingParam.default}
                        variant="bordered"
                        onValueChange={(v) =>
                          setEditingParam({ ...editingParam, default: v })
                        }
                      />
                    </div>
                    <Switch
                      isSelected={editingParam.required}
                      onValueChange={(v) =>
                        setEditingParam({ ...editingParam, required: v })
                      }
                    >
                      Required
                    </Switch>
                    {editingParam.type === "select" && (
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Options{" "}
                          <span className="text-default-400 text-tiny">
                            (key=value pairs)
                          </span>
                        </p>
                        <div className="space-y-2">
                          {(editingParam.options ?? []).map((opt, oi) => (
                            <div key={oi} className="flex gap-2 items-center">
                              <Input
                                placeholder="key"
                                size="sm"
                                value={opt.key}
                                variant="bordered"
                                onValueChange={(v) => {
                                  const opts = [
                                    ...(editingParam.options ?? []),
                                  ];

                                  opts[oi] = { ...opts[oi], key: v };
                                  setEditingParam({
                                    ...editingParam,
                                    options: opts,
                                  });
                                }}
                              />
                              <Input
                                placeholder="display label"
                                size="sm"
                                value={opt.value}
                                variant="bordered"
                                onValueChange={(v) => {
                                  const opts = [
                                    ...(editingParam.options ?? []),
                                  ];

                                  opts[oi] = { ...opts[oi], value: v };
                                  setEditingParam({
                                    ...editingParam,
                                    options: opts,
                                  });
                                }}
                              />
                              <Button
                                color="danger"
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => {
                                  const opts = (
                                    editingParam.options ?? []
                                  ).filter((_, i) => i !== oi);

                                  setEditingParam({
                                    ...editingParam,
                                    options: opts,
                                  });
                                }}
                              >
                                <Icon icon="hugeicons:delete-02" width={14} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            startContent={
                              <Icon icon="hugeicons:add-01" width={14} />
                            }
                            variant="flat"
                            onPress={() =>
                              setEditingParam({
                                ...editingParam,
                                options: [
                                  ...(editingParam.options ?? []),
                                  { key: "", value: "" } as InputParamOption,
                                ],
                              })
                            }
                          >
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => saveParam(onClose)}
                >
                  {editingIndex === null ? "Add" : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
