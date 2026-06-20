"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";

import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";
import SetFlowUseDag from "@/lib/fetch/flow/PUT/SetFlowUseDag";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

// Parse a dependency string into { sourceId, handle }.
// Format: "actionId:success" | "actionId:fail" | "actionId" (defaults to "success").
function parseDep(dep: string): {
  sourceId: string;
  handle: "success" | "fail";
} {
  const idx = dep.indexOf(":");
  if (idx >= 0) {
    const h = dep.slice(idx + 1);
    return {
      sourceId: dep.slice(0, idx),
      handle: h === "fail" ? "fail" : "success",
    };
  }
  return { sourceId: dep, handle: "success" };
}

function edgeStyle(handle: "success" | "fail") {
  return {
    strokeWidth: 2,
    stroke:
      handle === "fail"
        ? "hsl(var(--heroui-danger))"
        : "hsl(var(--heroui-success))",
  };
}

// Convert flow.actions array into React Flow nodes + edges
function actionsToGraph(actions: any[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = actions.map((action) => ({
    id: action.id,
    type: "actionNode",
    position: action.position ?? { x: 0, y: 0 },
    data: { action },
  }));

  const edges: Edge[] = [];
  for (const action of actions) {
    for (const dep of action.depends_on ?? []) {
      const { sourceId, handle } = parseDep(dep);
      edges.push({
        id: `${sourceId}:${handle}->${action.id}`,
        source: sourceId,
        target: action.id,
        sourceHandle: handle,
        animated: false,
        style: edgeStyle(handle),
        label: handle === "fail" ? "fail" : undefined,
      });
    }
  }

  return { nodes, edges };
}

// Convert React Flow nodes + edges back to the actions array format
function graphToActions(
  nodes: Node[],
  edges: Edge[],
  originalActions: any[],
): any[] {
  const actionById = Object.fromEntries(originalActions.map((a) => [a.id, a]));

  return nodes.map((node) => ({
    ...actionById[node.id],
    position: node.position,
    depends_on: edges
      .filter((e) => e.target === node.id)
      .map((e) => `${e.source}:${e.sourceHandle ?? "success"}`),
  }));
}

// Auto-layout for flows not yet in DAG mode
function autoLayout(actions: any[], execParallel: boolean): any[] {
  if (execParallel) {
    // Spread nodes horizontally, no depends_on
    return actions.map((action, i) => ({
      ...action,
      position: { x: i * 340, y: 0 },
      depends_on: [],
    }));
  } else {
    // Chain nodes vertically with success depends_on links
    return actions.map((action, i) => ({
      ...action,
      position: { x: 0, y: i * 180 },
      depends_on: i === 0 ? [] : [`${actions[i - 1].id}:success`],
    }));
  }
}

export function useFlowDAG(flow: any) {
  const { refreshFlowData } = useRefreshCache();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionsRef = useRef<any[]>(flow?.actions ?? []);

  // A stable key that changes when actions are added/removed/edited.
  // Deliberately excludes `position` so that debounced position saves don't
  // re-trigger this effect and snap nodes back while a drag is in flight.
  const actionsKey = (flow?.actions ?? [])
    .map(
      (a: any) =>
        `${a.id}:${a.custom_name ?? ""}:${a.custom_description ?? ""}:${a.version}:${a.active}`,
    )
    .sort()
    .join("|");

  // Initialise (or re-init when flow id/mode changes OR actions are added/removed/edited)
  useEffect(() => {
    if (!flow) return;

    let incoming: any[] = flow.actions ?? [];

    if (!flow.use_dag && incoming.length > 0) {
      // Auto-convert from sequential/parallel to DAG layout
      incoming = autoLayout(incoming, flow.exec_parallel);
      // Persist the conversion
      void (async () => {
        await UpdateFlowActions(flow.id, incoming);
        await SetFlowUseDag(flow.id, true);
        refreshFlowData(flow.id);
      })();
    }

    // Preserve positions that are already in the local canvas state (handles the
    // case where a position save is still debouncing when this effect fires).
    const localPosById: Record<string, { x: number; y: number }> = {};
    for (const a of actionsRef.current) {
      if (a.position) localPosById[a.id] = a.position;
    }
    const merged = incoming.map((a: any) => ({
      ...a,
      position: localPosById[a.id] ?? a.position ?? { x: 0, y: 0 },
    }));

    actionsRef.current = merged;
    const { nodes: n, edges: e } = actionsToGraph(merged);
    setNodes(n);
    setEdges(e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow?.id, flow?.use_dag, actionsKey]);

  // Debounced save of current graph state
  const scheduleSave = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        const updatedActions = graphToActions(
          updatedNodes,
          updatedEdges,
          actionsRef.current,
        );
        // Preserve actions added via modal that aren't yet in the captured canvas
        // nodes (e.g., added after drag started but before the debounce fires).
        const nodeIds = new Set(updatedNodes.map((n) => n.id));
        const extraActions = actionsRef.current.filter(
          (a: any) => !nodeIds.has(a.id),
        );
        const finalActions = [...updatedActions, ...extraActions];
        actionsRef.current = finalActions;
        await UpdateFlowActions(flow.id, finalActions);
        refreshFlowData(flow.id);
      }, 500);
    },
    [flow?.id, refreshFlowData],
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        // Only schedule a save on position changes (drag end), not selection
        const hasPositionChange = changes.some(
          (c) => c.type === "position" && !c.dragging,
        );
        if (hasPositionChange) scheduleSave(updated, edges);
        return updated;
      });
    },
    [edges, scheduleSave],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        scheduleSave(nodes, updated);
        return updated;
      });
    },
    [nodes, scheduleSave],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const handle = (connection.sourceHandle ?? "success") as
          | "success"
          | "fail";
        const updated = addEdge(
          {
            ...connection,
            animated: false,
            style: edgeStyle(handle),
            label: handle === "fail" ? "fail" : undefined,
          },
          eds,
        );
        scheduleSave(nodes, updated);
        return updated;
      });
    },
    [nodes, scheduleSave],
  );

  // Called after a new action is added via modal or drag-drop
  const refreshGraph = useCallback(() => {
    refreshFlowData(flow.id);
  }, [flow?.id, refreshFlowData]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    refreshGraph,
    actionsRef,
  };
}
