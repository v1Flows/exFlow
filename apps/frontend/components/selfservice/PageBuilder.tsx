"use client";

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import CreateSelfServicePage from "@/lib/fetch/selfservice/POST/create";
import UpdateSelfServicePage from "@/lib/fetch/selfservice/PUT/update";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import { useFlows, useProjects } from "@/lib/swr/hooks/flows";
import { PageFlow, SelfServicePage } from "@/types";

const EXECUTION_VISIBILITY_OPTIONS = [
  { key: "simplified", label: "Simplified (status only)" },
  { key: "detailed", label: "Detailed (steps)" },
  { key: "full", label: "Full (steps + output)" },
];

interface PageBuilderProps {
  existing?: SelfServicePage;
}

export default function PageBuilder({ existing }: PageBuilderProps) {
  const router = useRouter();
  const { refreshSelfServicePages, refreshSelfServicePage } = useRefreshCache();
  const { flows } = useFlows();
  const { projects } = useProjects();

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [projectId, setProjectId] = useState(existing?.project_id ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? "hugeicons:layout-01");
  const [color, setColor] = useState(existing?.color ?? "#006FEE");
  const [enabled, setEnabled] = useState(existing?.enabled ?? true);
  const [pageFlows, setPageFlows] = useState<PageFlow[]>(
    existing?.page_flows ?? [],
  );
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from name (only when creating new)
  function handleNameChange(v: string) {
    setName(v);
    if (!existing) {
      setSlug(
        v
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  }

  function addFlow(flowId: string) {
    if (!flowId || pageFlows.find((pf) => pf.flow_id === flowId)) return;
    setPageFlows([
      ...pageFlows,
      {
        flow_id: flowId,
        order: pageFlows.length,
        custom_label: "",
        custom_description: "",
        execution_visibility: "simplified",
        input_overrides: [],
      },
    ]);
  }

  function removeFlow(flowId: string) {
    setPageFlows((prev) => prev.filter((pf) => pf.flow_id !== flowId));
  }

  function updatePageFlow(flowId: string, patch: Partial<PageFlow>) {
    setPageFlows((prev) =>
      prev.map((pf) => (pf.flow_id === flowId ? { ...pf, ...patch } : pf)),
    );
  }

  async function save() {
    if (!name.trim() || !slug.trim()) {
      addToast({
        title: "Validation",
        description: "Name and slug are required.",
        color: "warning",
        variant: "flat",
      });

      return;
    }

    setSaving(true);

    if (existing) {
      const res = await UpdateSelfServicePage(existing.id, {
        name,
        description,
        slug,
        icon,
        color,
        enabled,
        page_flows: pageFlows,
      });

      setSaving(false);

      if (res.success) {
        refreshSelfServicePages();
        refreshSelfServicePage(existing.slug);
        refreshSelfServicePage(existing.id);
        addToast({
          title: "Service Page",
          description: "Updated successfully.",
          color: "success",
          variant: "flat",
        });
        router.push(`/services/${slug}`);
      } else {
        addToast({
          title: "Error",
          description: ("message" in res ? res.message : ""),
          color: "danger",
          variant: "flat",
        });
      }
    } else {
      const res = await CreateSelfServicePage({
        name,
        description,
        slug,
        project_id: projectId,
        icon,
        color,
        enabled,
        page_flows: pageFlows,
      });

      setSaving(false);

      if (res.success) {
        refreshSelfServicePages();
        addToast({
          title: "Service Page",
          description: "Created successfully.",
          color: "success",
          variant: "flat",
        });
        router.push(`/services/${slug}`);
      } else {
        addToast({
          title: "Error",
          description: ("message" in res ? res.message : ""),
          color: "danger",
          variant: "flat",
        });
      }
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {existing ? "Edit Service Page" : "Create Service Page"}
          </h1>
          <p className="text-default-400 text-sm mt-1">
            Configure which workflows users can run from this page.
          </p>
        </div>
        <Button
          color="primary"
          isLoading={saving}
          startContent={
            !saving && <Icon icon="hugeicons:floppy-disk" width={18} />
          }
          onPress={save}
        >
          {existing ? "Save Changes" : "Create Page"}
        </Button>
      </div>

      {/* Basic info */}
      <Card className="bg-content1/60 backdrop-blur-md border border-default-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon icon="hugeicons:information-circle" width={22} />
          </div>
          <div>
            <p className="font-bold">Basic Info</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              isRequired
              label="Name"
              placeholder="My Service Page"
              value={name}
              variant="bordered"
              onValueChange={handleNameChange}
            />
            <Input
              isRequired
              description="URL-friendly identifier (lowercase, hyphens)"
              label="Slug"
              placeholder="my-service-page"
              value={slug}
              variant="bordered"
              onValueChange={setSlug}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="What does this page allow users to do?"
            value={description}
            variant="bordered"
            onValueChange={setDescription}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              description="Iconify icon name"
              label="Icon"
              placeholder="hugeicons:layout-01"
              value={icon}
              variant="bordered"
              onValueChange={setIcon}
            />
            <Input
              label="Color (hex)"
              placeholder="#006FEE"
              type="color"
              value={color}
              variant="bordered"
              onValueChange={setColor}
            />
            <div className="flex items-center pt-4">
              <Switch isSelected={enabled} onValueChange={setEnabled}>
                Enabled
              </Switch>
            </div>
          </div>
          {!existing && (
            <Select
              isRequired
              label="Project"
              placeholder="Select project"
              selectedKeys={projectId ? [projectId] : []}
              variant="bordered"
              onSelectionChange={(keys) =>
                setProjectId(keys.currentKey as string)
              }
            >
              {((projects as any[]) ?? []).map((p: any) => (
                <SelectItem key={p.id}>{p.name}</SelectItem>
              ))}
            </Select>
          )}
        </CardBody>
      </Card>

      {/* Flows */}
      <Card className="bg-content1/60 backdrop-blur-md border border-default-100">
        <CardHeader className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Icon icon="hugeicons:structure-04" width={22} />
            </div>
            <div>
              <p className="font-bold">Workflows</p>
              <p className="text-small text-default-500">
                Add workflows users can trigger from this page.
              </p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <Select
            label="Add workflow"
            placeholder="Select a workflow to add"
            variant="bordered"
            onSelectionChange={(keys) =>
              addFlow(keys.currentKey as string)
            }
          >
            {(flows ?? [])
              .filter(
                (f: any) =>
                  !pageFlows.find((pf) => pf.flow_id === f.id),
              )
              .map((f: any) => (
                <SelectItem key={f.id}>{f.name}</SelectItem>
              ))}
          </Select>

          {pageFlows.length === 0 && (
            <p className="text-sm text-default-400 text-center py-4">
              No workflows added yet.
            </p>
          )}

          {pageFlows.map((pf, idx) => {
            const flowMeta: any = (flows ?? []).find(
              (f: any) => f.id === pf.flow_id,
            );

            return (
              <Card
                key={pf.flow_id}
                className="border border-default-100 bg-content2/40"
              >
                <CardHeader className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="flat">
                      #{idx + 1}
                    </Chip>
                    <span className="font-medium text-sm">
                      {flowMeta?.name ?? pf.flow_id}
                    </span>
                  </div>
                  <Button
                    color="danger"
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => removeFlow(pf.flow_id)}
                  >
                    <Icon icon="hugeicons:delete-02" width={16} />
                  </Button>
                </CardHeader>
                <Divider />
                <CardBody className="gap-3 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Custom Label"
                      placeholder={flowMeta?.name ?? ""}
                      size="sm"
                      value={pf.custom_label}
                      variant="bordered"
                      onValueChange={(v) =>
                        updatePageFlow(pf.flow_id, { custom_label: v })
                      }
                    />
                    <Select
                      label="Execution Visibility"
                      selectedKeys={[pf.execution_visibility]}
                      size="sm"
                      variant="bordered"
                      onSelectionChange={(keys) =>
                        updatePageFlow(pf.flow_id, {
                          execution_visibility: keys.currentKey as
                            | "simplified"
                            | "detailed"
                            | "full",
                        })
                      }
                    >
                      {EXECUTION_VISIBILITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.key}>{opt.label}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <Input
                    label="Custom Description"
                    placeholder={flowMeta?.description ?? ""}
                    size="sm"
                    value={pf.custom_description}
                    variant="bordered"
                    onValueChange={(v) =>
                      updatePageFlow(pf.flow_id, { custom_description: v })
                    }
                  />
                </CardBody>
              </Card>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
