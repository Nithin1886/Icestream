import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ShoppingCart,
  Radio,
  Cpu,
  ShieldAlert,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Custom node rendering function for pipeline DAG
function CustomPipelineNode({ data }) {
  const isQuarantined = data.isQuarantined;
  const isQuarantineGate = data.nodeKey === "observability";

  return (
    <div
      className={`dag-node-card ${data.status} ${
        isQuarantineGate && isQuarantined ? "node-quarantined" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="dag-handle" />
      <div className="dag-node-header">
        <div className={`dag-node-icon ${data.type}`}>
          {data.icon}
        </div>
        <div className="dag-node-title-group">
          <div className="dag-node-title">{data.label}</div>
          <div className="dag-node-subtitle">{data.subtitle}</div>
        </div>
      </div>

      <div className="dag-node-body">
        <div className="dag-metric-row">
          <span>Throughput</span>
          <span className="dag-metric-val">{data.rate}</span>
        </div>
        <div className="dag-metric-row">
          <span>Latency</span>
          <span className="dag-metric-val">{data.latency}</span>
        </div>
      </div>

      <div className="dag-node-footer">
        {isQuarantined && isQuarantineGate ? (
          <span className="dag-status-badge quarantined">
            <AlertTriangle size={12} /> QUARANTINED (Pipeline Paused)
          </span>
        ) : (
          <span className={`dag-status-badge ${data.status}`}>
            <CheckCircle2 size={12} /> {data.statusText || "Operational"}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="dag-handle" />
    </div>
  );
}

const nodeTypes = {
  pipelineNode: CustomPipelineNode,
};

export default function DataLineageDag({ quarantineState = {} }) {
  const isQuarantined = !!quarantineState.quarantineActive;

  const initialNodes = useMemo(() => {
    return [
      {
        id: "producers",
        type: "pipelineNode",
        position: { x: 20, y: 120 },
        data: {
          nodeKey: "producers",
          label: "Checkout Telemetry",
          subtitle: "Event Producers",
          type: "source",
          rate: "4.8k msg/s",
          latency: "1ms",
          status: "healthy",
          icon: <ShoppingCart size={18} />,
        },
      },
      {
        id: "kafka",
        type: "pipelineNode",
        position: { x: 280, y: 120 },
        data: {
          nodeKey: "kafka",
          label: "Kafka 4.3 Cluster",
          subtitle: "KRaft Message Broker",
          type: "broker",
          rate: "4.6k msg/s",
          latency: "3ms",
          status: "healthy",
          icon: <Radio size={18} />,
        },
      },
      {
        id: "flink",
        type: "pipelineNode",
        position: { x: 540, y: 120 },
        data: {
          nodeKey: "flink",
          label: "Flink Stream Engine",
          subtitle: "Stateful Windowing",
          type: "processor",
          rate: isQuarantined ? "0 msg/s (Paused)" : "4.5k msg/s",
          latency: "12ms",
          status: isQuarantined ? "warning" : "healthy",
          statusText: isQuarantined ? "Upstream Paused" : "Operational",
          icon: <Cpu size={18} />,
        },
      },
      {
        id: "observability",
        type: "pipelineNode",
        position: { x: 800, y: 120 },
        data: {
          nodeKey: "observability",
          label: "Observability Rules Engine",
          subtitle: "Great Expectations Gate",
          type: "validator",
          rate: "4.5k msg/s",
          latency: "8ms",
          status: isQuarantined ? "error" : "healthy",
          statusText: isQuarantined ? "QUARANTINED" : "Passing (Tax Null < 50%)",
          isQuarantined: isQuarantined,
          icon: <ShieldAlert size={18} />,
        },
      },
      {
        id: "iceberg",
        type: "pipelineNode",
        position: { x: 1060, y: 40 },
        data: {
          nodeKey: "iceberg",
          label: "Apache Iceberg Lake",
          subtitle: "S3 ACID Open Table",
          type: "storage",
          rate: isQuarantined ? "0 msg/s (Isolated)" : "4.3k msg/s",
          latency: "18ms",
          status: isQuarantined ? "warning" : "healthy",
          statusText: isQuarantined ? "Isolated" : "ACID Committed",
          icon: <Layers size={18} />,
        },
      },
      {
        id: "postgres",
        type: "pipelineNode",
        position: { x: 1060, y: 220 },
        data: {
          nodeKey: "postgres",
          label: "PostgreSQL Sink",
          subtitle: "Analytics DB (v16.4)",
          type: "storage",
          rate: isQuarantined ? "0 msg/s (Paused)" : "4.2k msg/s",
          latency: "5ms",
          status: isQuarantined ? "warning" : "healthy",
          statusText: isQuarantined ? "Ingestion Paused" : "Healthy",
          icon: <Database size={18} />,
        },
      },
    ];
  }, [isQuarantined]);

  const initialEdges = useMemo(() => {
    const defaultStyle = { stroke: "#3b82f6", strokeWidth: 2 };
    const errorStyle = { stroke: "#ef4444", strokeWidth: 3, strokeDasharray: "5 5" };

    return [
      {
        id: "e-prod-kafka",
        source: "producers",
        target: "kafka",
        animated: true,
        style: defaultStyle,
      },
      {
        id: "e-kafka-flink",
        source: "kafka",
        target: "flink",
        animated: !isQuarantined,
        style: isQuarantined ? errorStyle : defaultStyle,
      },
      {
        id: "e-flink-obs",
        source: "flink",
        target: "observability",
        animated: true,
        style: isQuarantined ? errorStyle : defaultStyle,
      },
      {
        id: "e-obs-iceberg",
        source: "observability",
        target: "iceberg",
        animated: !isQuarantined,
        style: isQuarantined ? errorStyle : defaultStyle,
      },
      {
        id: "e-obs-postgres",
        source: "observability",
        target: "postgres",
        animated: !isQuarantined,
        style: isQuarantined ? errorStyle : defaultStyle,
      },
    ];
  }, [isQuarantined]);

  return (
    <div className="card dag-container-card">
      <div className="card-header">
        <div className="card-title">
          <Layers size={16} /> Real-Time Data Lineage & Quarantine Topology (React Flow)
        </div>
        <div className="dag-header-meta">
          <span className={`dag-indicator ${isQuarantined ? "quarantined" : "healthy"}`}>
            {isQuarantined ? "🚨 PIPELINE QUARANTINED (Zero-Human Intervention)" : "⚡ STREAM ACTIVE"}
          </span>
        </div>
      </div>

      <div className="dag-wrapper" style={{ width: "100%", height: "320px" }}>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
