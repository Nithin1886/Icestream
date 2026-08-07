import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { throughputData as initialData } from "../data/dummyData";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "rgba(12, 16, 32, 0.95)",
        border: "1px solid rgba(34, 211, 238, 0.2)",
        borderRadius: 10,
        padding: "12px 16px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      <p
        style={{
          color: "#94a3b8",
          fontSize: "0.7rem",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{
            color: entry.color,
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          {entry.name === "messagesIn" ? "Messages In" : "Messages Out"}:{" "}
          {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function ThroughputChart() {
  const [data, setData] = useState(initialData);

  // Simulate live data shifting
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const now = new Date();
        const label = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const base = 3800 + Math.sin(Date.now() * 0.001) * 600;
        const newPoint = {
          time: label,
          messagesIn: Math.round(base + Math.random() * 400),
          messagesOut: Math.round(base * 0.92 + Math.random() * 300),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" id="throughput-chart">
      <div className="card-title">Message Throughput</div>

      <div className="chart-legend">
        <div className="chart-legend-item">
          <div
            className="chart-legend-dot"
            style={{ background: "#22d3ee" }}
          />
          Messages In
        </div>
        <div className="chart-legend-item">
          <div
            className="chart-legend-dot"
            style={{ background: "#3b82f6" }}
          />
          Messages Out
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradientIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#475569", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.08)" }}
              interval="preserveStartEnd"
              minTickGap={40}
            />

            <YAxis
              tick={{ fill: "#475569", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
              }
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="messagesIn"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#gradientIn)"
              animationDuration={800}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#22d3ee",
                stroke: "#0c1020",
                strokeWidth: 2,
              }}
            />

            <Area
              type="monotone"
              dataKey="messagesOut"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradientOut)"
              animationDuration={800}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#3b82f6",
                stroke: "#0c1020",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
