"use client";
import {
  Button,
  Card,
  Chip,
  Description,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Select,
  Separator,
  Switch,
  TextField,
  toast,
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
      toast.warning("Validation", {
        description: "Name and slug are required.",
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
        toast.success("Service Page", { description: "Updated successfully." });
        router.push(`/services/${slug}`);
      } else {
        toast.danger("Error", {
          description: "message" in res ? res.message : "",
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
        toast.success("Service Page", { description: "Created successfully." });
        router.push(`/services/${slug}`);
      } else {
        toast.danger("Error", {
          description: "message" in res ? res.message : "",
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
          <p className="text-muted text-sm mt-1">
            Configure which workflows users can run from this page.
          </p>
        </div>
        <Button isPending={saving} onPress={save} variant="primary">
          {!saving && <Icon icon="hugeicons:floppy-disk" width={18} />}
          {existing ? "Save Changes" : "Create Page"}
        </Button>
      </div>

      {/* Basic info */}
      <Card className="bg-surface/60 backdrop-blur-md border border-default">
        <Card.Header className="flex gap-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Icon icon="hugeicons:information-circle" width={22} />
          </div>
          <div>
            <p className="font-bold">Basic Info</p>
          </div>
        </Card.Header>
        <Separator />
        <Card.Content className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField isRequired value={name} onChange={handleNameChange}>
              <Label>{"Name"}</Label>
              <InputGroup>
                <InputGroup.Input placeholder="My Service Page" />
              </InputGroup>
            </TextField>
            <TextField isRequired value={slug} onChange={setSlug}>
              <Label>{"Slug"}</Label>
              <InputGroup>
                <InputGroup.Input placeholder="my-service-page" />
              </InputGroup>
              <Description>
                {"URL-friendly identifier (lowercase, hyphens)"}
              </Description>
            </TextField>
          </div>
          <TextField value={description} onChange={setDescription}>
            <Label>{"Description"}</Label>
            <InputGroup.TextArea placeholder={"What does this page allow users to do?"} />
          </TextField>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField value={icon} onChange={setIcon}>
              <Label>{"Icon"}</Label>
              <InputGroup>
                <InputGroup.Input placeholder="hugeicons:layout-01" />
              </InputGroup>
              <Description>{"Iconify icon name"}</Description>
            </TextField>
            <TextField value={color} onChange={setColor}>
              <Label>{"Color (hex)"}</Label>
              <InputGroup>
                <InputGroup.Input placeholder="#006FEE" type="color" />
              </InputGroup>
            </TextField>
            <div className="flex items-center pt-4">
              <Switch isSelected={enabled} onChange={setEnabled}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Content>Enabled</Switch.Content>
              </Switch>
            </div>
          </div>
          {!existing && (
            <Select
              isRequired
              placeholder="Select project"
              selectedKey={projectId ? projectId : null}
              onSelectionChange={(keys) => setProjectId(keys as string)}
            >
              <Label>{"Project"}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {((projects as any[]) ?? []).map((p: any) => (
                    <ListBox.Item key={p.id} id={p.id}>
                      {p.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          )}
        </Card.Content>
      </Card>

      {/* Flows */}
      <Card className="bg-surface/60 backdrop-blur-md border border-default">
        <Card.Header className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-default/10 text-default-foreground">
              <Icon icon="hugeicons:structure-04" width={22} />
            </div>
            <div>
              <p className="font-bold">Workflows</p>
              <p className="text-sm text-muted">
                Add workflows users can trigger from this page.
              </p>
            </div>
          </div>
        </Card.Header>
        <Separator />
        <Card.Content className="gap-4">
          <Select
            placeholder="Select a workflow to add"
            onSelectionChange={(keys) => addFlow(keys as string)}
          >
            <Label>{"Add workflow"}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {(flows ?? [])
                  .filter(
                    (f: any) => !pageFlows.find((pf) => pf.flow_id === f.id),
                  )
                  .map((f: any) => (
                    <ListBox.Item key={f.id} id={f.id}>
                      {f.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
              </ListBox>
            </Select.Popover>
          </Select>

          {pageFlows.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
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
                className="border border-default bg-surface-secondary/40"
              >
                <Card.Header className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="soft">
                      <Chip.Label>#{idx + 1}</Chip.Label>
                    </Chip>
                    <span className="font-medium text-sm">
                      {flowMeta?.name ?? pf.flow_id}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onPress={() => removeFlow(pf.flow_id)}
                    className="aspect-square p-0"
                  >
                    <Icon icon="hugeicons:delete-02" width={16} />
                  </Button>
                </Card.Header>
                <Separator />
                <Card.Content className="gap-3 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      value={pf.custom_label}
                      onChange={(v) =>
                        updatePageFlow(pf.flow_id, { custom_label: v })
                      }
                    >
                      <Label>{"Custom Label"}</Label>
                      <InputGroup>
                        <InputGroup.Input placeholder={flowMeta?.name ?? ""} />
                      </InputGroup>
                    </TextField>
                    <Select
                      selectedKey={pf.execution_visibility}
                      onSelectionChange={(keys) =>
                        updatePageFlow(pf.flow_id, {
                          execution_visibility: keys as
                            | "simplified"
                            | "detailed"
                            | "full",
                        })
                      }
                    >
                      <Label>{"Execution Visibility"}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {EXECUTION_VISIBILITY_OPTIONS.map((opt) => (
                            <ListBox.Item key={opt.key} id={opt.key}>
                              {opt.label}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                  <TextField
                    value={pf.custom_description}
                    onChange={(v) =>
                      updatePageFlow(pf.flow_id, { custom_description: v })
                    }
                  >
                    <Label>{"Custom Description"}</Label>
                    <InputGroup>
                      <InputGroup.Input placeholder={flowMeta?.description ?? ""} />
                    </InputGroup>
                  </TextField>
                </Card.Content>
              </Card>
            );
          })}
        </Card.Content>
      </Card>
    </div>
  );
}
