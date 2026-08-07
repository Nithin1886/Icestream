import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { validationMetrics } from "../data/dummyData";

function ProgressRing({ value, color, label }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="validation-ring">
      <div className="ring-container">
        <svg viewBox="0 0 80 80">
          <circle className="ring-bg" cx="40" cy="40" r={radius} />
          <circle
            className="ring-fill"
            cx="40"
            cy="40"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="ring-value" style={{ color }}>
          {value}%
        </div>
      </div>
      <span className="ring-label">{label}</span>
    </div>
  );
}

export default function ValidationMetrics() {
  const m = validationMetrics;

  return (
    <div className="card" id="validation-metrics">
      <div className="card-title">
        <ShieldCheck
          size={14}
          style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}
        />
        Validation Metrics
      </div>

      <div className="validation-rings">
        <ProgressRing
          value={m.passRate}
          color="#34d399"
          label="Pass Rate"
        />
        <ProgressRing
          value={m.schemaCompliance}
          color="#22d3ee"
          label="Schema"
        />
        <ProgressRing
          value={m.dataQuality}
          color="#3b82f6"
          label="Quality"
        />
      </div>

      <div className="validation-breakdown">
        <div className="validation-stat">
          <div className="validation-stat-icon total">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="validation-stat-label">Total</div>
            <div className="validation-stat-value">
              {m.totalValidated.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="validation-stat">
          <div className="validation-stat-icon passed">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="validation-stat-label">Passed</div>
            <div className="validation-stat-value">
              {m.passed.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="validation-stat">
          <div className="validation-stat-icon failed">
            <XCircle size={16} />
          </div>
          <div>
            <div className="validation-stat-label">Failed</div>
            <div className="validation-stat-value">
              {m.failed.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="validation-stat">
          <div className="validation-stat-icon warnings">
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="validation-stat-label">Warnings</div>
            <div className="validation-stat-value">
              {m.warnings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
