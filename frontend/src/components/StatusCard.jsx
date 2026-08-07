import { Radio, Cpu, Database } from "lucide-react";

const ICON_MAP = {
  kafka: Radio,
  flink: Cpu,
  postgres: Database,
};

export default function StatusCard({ serviceKey, data }) {
  const Icon = ICON_MAP[serviceKey] || Radio;
  const statusClass = data.status.toLowerCase();

  // Pick 4 metrics to display in the mini-grid
  const metricEntries = Object.entries(data.metrics).slice(0, 4);

  // Format metric labels from camelCase → Title Case
  function formatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  // Format metric values
  function formatValue(val) {
    if (typeof val === "number" && val >= 1000) {
      return val.toLocaleString();
    }
    return String(val);
  }

  return (
    <div className="card" id={`status-card-${serviceKey}`}>
      <div className="status-card-header">
        <div className={`status-card-icon ${serviceKey}`}>
          <Icon size={20} />
        </div>
        <span className={`status-badge ${statusClass}`}>
          <span className="status-badge-dot" />
          {data.status}
        </span>
      </div>

      <div className="status-card-name">{data.name}</div>
      <div className="status-card-version">v{data.version}</div>

      <div className="status-card-metrics">
        {metricEntries.map(([key, val]) => (
          <div className="status-metric" key={key}>
            <div className="status-metric-label">{formatLabel(key)}</div>
            <div className="status-metric-value">{formatValue(val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
