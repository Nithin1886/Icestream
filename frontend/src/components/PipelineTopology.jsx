import { ArrowRight, Server, Cpu, Radio, ShieldCheck, Database } from "lucide-react";
import { pipelineNodes } from "../data/dummyData";

const NODE_ICONS = {
  source: Radio,
  broker: Server,
  processor: Cpu,
  validator: ShieldCheck,
  storage: Database,
};

export default function PipelineTopology() {
  return (
    <div className="card" id="pipeline-topology">
      <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Stream Pipeline Topology</span>
        <span className="topology-live-badge">
          <span className="pulse-dot" /> End-to-End Processing Active
        </span>
      </div>

      <div className="topology-flow">
        {pipelineNodes.map((node, index) => {
          const Icon = NODE_ICONS[node.type] || Server;
          const isLast = index === pipelineNodes.length - 1;

          return (
            <div className="topology-step-group" key={node.id}>
              <div className={`topology-node ${node.status}`}>
                <div className="topology-node-icon">
                  <Icon size={18} />
                </div>
                <div className="topology-node-content">
                  <div className="topology-node-title">{node.label}</div>
                  <div className="topology-node-stats">
                    <span className="rate">{node.rate}</span>
                    <span className="divider">•</span>
                    <span className="latency">{node.latency} lat</span>
                  </div>
                </div>
              </div>

              {!isLast && (
                <div className="topology-connector">
                  <div className="connector-line">
                    <div className="connector-pulse" />
                  </div>
                  <ArrowRight size={14} className="connector-arrow" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
