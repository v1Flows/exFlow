"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Icon } from "@iconify/react";
import { Button, useDisclosure } from "@heroui/react";
import { useTheme } from "next-themes";
import { v4 as uuidv4 } from "uuid";

import ActionNode from "./ActionNode";
import { useFlowDAG } from "./useFlowDAG";
import PluginSidebar from "./PluginSidebar";
import AddFlowActionModal from "@/components/modals/actions/addFlow";
import FlowActionDetails from "@/components/modals/actions/details";
import EditActionModal from "@/components/modals/actions/edit";
import CopyActionModal from "@/components/modals/actions/copy";
import DeleteActionModal from "@/components/modals/actions/delete";
import UpgradeActionModal from "@/components/modals/actions/upgrade";
import CopyActionToDifferentFlowModal from "@/components/modals/actions/transferCopy";
import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";

const nodeTypes = { actionNode: ActionNode };

const DEFAULT_CONDITION = {
  selected_action_id: "",
  condition_items: [
    {
      condition_key: "",
      condition_type: "",
      condition_value: "",
      condition_logic: "and",
    },
  ],
  cancel_execution: false,
};

function FlowCanvasInner({
  flow,
  flows,
  projects,
  runners,
  user,
  canEdit,
  settings,
}: {
  flow: any;
  flows: any;
  projects: any;
  runners: any;
  user: any;
  canEdit: boolean;
  settings: any;
}) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    actionsRef,
  } = useFlowDAG(flow);

  const { screenToFlowPosition } = useReactFlow();

  const [targetAction, setTargetAction] = useState<any>({});
  const [updatedAction, setUpdatedAction] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const viewFlowActionDetails = useDisclosure();
  const addFlowActionModal = useDisclosure();
  const editActionModal = useDisclosure();
  const copyFlowActionModal = useDisclosure();
  const upgradeFlowActionModal = useDisclosure();
  const deleteActionModal = useDisclosure();
  const copyActionToDifferentFlowModal = useDisclosure();

  const isDisabled = (!canEdit || flow.disabled) && user.role !== "admin";

  const handleNodeOpen = useCallback(
    (action: any) => {
      setTargetAction(action);
      viewFlowActionDetails.onOpen();
    },
    [viewFlowActionDetails],
  );

  const handleNodeEdit = useCallback(
    (action: any) => {
      setTargetAction(action);
      editActionModal.onOpen();
    },
    [editActionModal],
  );

  const handleNodeCopy = useCallback(
    (action: any) => {
      // Duplicate the node directly in the canvas at a slight offset
      const original = actionsRef.current.find((a: any) => a.id === action.id);
      if (!original) return;
      const duplicate = {
        ...original,
        id: uuidv4(),
        custom_name: original.custom_name ? `${original.custom_name} (copy)` : "",
        position: {
          x: (original.position?.x ?? 0) + 40,
          y: (original.position?.y ?? 0) + 40,
        },
        depends_on: [],
        condition: original.condition ?? DEFAULT_CONDITION,
      };
      const updatedActions = [...actionsRef.current, duplicate];
      actionsRef.current = updatedActions;
      void UpdateFlowActions(flow.id, updatedActions);
      setTargetAction(duplicate);
      setTimeout(() => editActionModal.onOpen(), 0);
    },
    [actionsRef, flow.id, editActionModal],
  );

  const handleNodeDelete = useCallback(
    (action: any) => {
      setTargetAction(action);
      deleteActionModal.onOpen();
    },
    [deleteActionModal],
  );

  const nodesWithHandlers = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onOpen: handleNodeOpen,
          onEdit: handleNodeEdit,
          onCopy: handleNodeCopy,
          onDelete: handleNodeDelete,
        },
      })),
    [nodes, handleNodeOpen, handleNodeEdit, handleNodeCopy, handleNodeDelete],
  );

  const { theme } = useTheme();
  const colorMode = theme === "light" ? "light" : "dark";

  // Drop handler: create a new node from a dragged sidebar action
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/reactflow");
      if (!raw) return;

      let plugin: any;
      try {
        plugin = JSON.parse(raw);
      } catch {
        return;
      }

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      const newAction = {
        ...plugin,
        id: uuidv4(),
        custom_name: "",
        custom_description: "",
        params: (plugin.params ?? []).map((p: any) => ({ ...p, value: p.default ?? "" })),
        depends_on: [],
        position,
        active: true,
        failure_pipeline_id: "",
        condition: DEFAULT_CONDITION,
      };

      const updatedActions = [...actionsRef.current, newAction];
      actionsRef.current = updatedActions;
      void UpdateFlowActions(flow.id, updatedActions);

      // Set targetAction first, defer modal open so the edit modal's useEffect
      // can populate its internal `action` state before content renders.
      setTargetAction(newAction);
      setTimeout(() => editActionModal.onOpen(), 0);
    },
    [screenToFlowPosition, actionsRef, flow.id, editActionModal],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  return (
    <div
      className="flex rounded-xl border border-default-100 overflow-hidden bg-content1"
      style={{ height: 600 }}
    >
      {/* Collapsible action sidebar */}
      <PluginSidebar
        isOpen={sidebarOpen}
        runners={runners}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* React Flow canvas */}
      <div className="flex-1 relative">
        {/*
          colorMode mirrors next-themes — activates .react-flow.dark or .react-flow.light
          which sets the correct defaults for controls, minimap, edges, and dots.
          We then override specific xy CSS variables to match HeroUI's palette.
        */}
        <ReactFlow
          colorMode={colorMode}
          edges={edges}
          fitView
          nodeTypes={nodeTypes}
          nodes={nodesWithHandlers}
          snapGrid={[20, 20]}
          snapToGrid
          style={{
            "--xy-background-color-default": "hsl(var(--heroui-content1))",
            "--xy-background-pattern-dots-color-default":
              "hsl(var(--heroui-default-300))",
            "--xy-edge-stroke-default": "hsl(var(--heroui-primary))",
            "--xy-edge-stroke-selected-default":
              "hsl(var(--heroui-primary-400))",
            "--xy-connectionline-stroke-default": "hsl(var(--heroui-primary))",
            "--xy-controls-button-background-color-default":
              "hsl(var(--heroui-content2))",
            "--xy-controls-button-background-color-hover-default":
              "hsl(var(--heroui-content3))",
            "--xy-controls-button-color-default":
              "hsl(var(--heroui-foreground))",
            "--xy-controls-button-border-color-default":
              "hsl(var(--heroui-default-100))",
            "--xy-minimap-background-color-default":
              "hsl(var(--heroui-content2))",
            "--xy-minimap-mask-background-color-default":
              "hsl(var(--heroui-content1) / 0.7)",
          } as React.CSSProperties}
          onConnect={isDisabled ? undefined : onConnect}
          onDragOver={isDisabled ? undefined : onDragOver}
          onDrop={isDisabled ? undefined : onDrop}
          onEdgesChange={isDisabled ? undefined : onEdgesChange}
          onNodesChange={onNodesChange}
        >
          {/* Sidebar toggle + Add action button when sidebar is closed */}
          <Panel position="top-left">
            {!sidebarOpen && (
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => setSidebarOpen(true)}
                >
                  <Icon icon="hugeicons:sidebar-right" width={16} />
                </Button>
                <Button
                  color="primary"
                  isDisabled={isDisabled || !settings.add_flow_actions}
                  size="sm"
                  startContent={<Icon icon="hugeicons:plus-sign" width={16} />}
                  onPress={addFlowActionModal.onOpen}
                >
                  Add Action
                </Button>
              </div>
            )}
          </Panel>

          <Controls
            style={{
              backgroundColor: "hsl(var(--heroui-content2))",
              borderColor: "hsl(var(--heroui-default-100))",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          />
          <MiniMap
            maskColor="hsl(var(--heroui-content1) / 0.8)"
            nodeColor="hsl(var(--heroui-content3))"
            nodeStrokeWidth={3}
            pannable
            style={{
              backgroundColor: "hsl(var(--heroui-content2))",
              borderRadius: "12px",
              border: "1px solid hsl(var(--heroui-default-100))",
            }}
            zoomable
          />
          <Background
            color="hsl(var(--heroui-default-300))"
            gap={24}
            size={1.5}
            variant={BackgroundVariant.Dots}
          />
        </ReactFlow>
      </div>

      {/* Modals */}
      <AddFlowActionModal
        disclosure={addFlowActionModal}
        flow={flow}
        project={projects?.find((p: any) => p.id === flow.project_id)}
        runners={runners}
        user={user}
      />
      <FlowActionDetails
        action={targetAction}
        disclosure={viewFlowActionDetails}
        flow={flow}
      />
      <EditActionModal
        disclosure={editActionModal}
        flow={flow}
        runners={runners}
        targetAction={targetAction}
      />
      <CopyActionModal
        copyAction={targetAction}
        disclosure={copyFlowActionModal}
        flow={flow}
        runners={runners}
      />
      <CopyActionToDifferentFlowModal
        copyAction={targetAction}
        disclosure={copyActionToDifferentFlowModal}
        flow={flow}
        flows={flows}
        projects={projects}
        runners={runners}
      />
      <UpgradeActionModal
        disclosure={upgradeFlowActionModal}
        flow={flow}
        runners={runners}
        targetAction={targetAction}
        updatedAction={updatedAction}
      />
      <DeleteActionModal
        actionID={targetAction?.id}
        disclosure={deleteActionModal}
        flowID={flow.id}
      />
    </div>
  );
}

export default function FlowCanvas(props: {
  flow: any;
  flows: any;
  projects: any;
  runners: any;
  user: any;
  canEdit: boolean;
  settings: any;
}) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
