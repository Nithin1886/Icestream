// =============================================================================
// IceStream — Extended Enterprise Dummy Data
// =============================================================================

export const serviceStatuses = {
  kafka: {
    name: "Apache Kafka",
    status: "Connected",
    version: "4.3.1",
    clusterId: "MkU3OEVBNTcwNTJENDM2Qk",
    metrics: {
      brokers: 3,
      topics: 12,
      partitions: 36,
      messagesPerSec: 4280,
      activeConsumers: 18,
      underReplicated: 0,
    },
  },
  flink: {
    name: "Apache Flink",
    status: "Running",
    version: "1.20.1",
    jobManager: "flink-jm-01.internal:8081",
    metrics: {
      jobsRunning: 2,
      taskManagers: 4,
      slotsTotal: 16,
      slotsAvailable: 6,
      checkpointSuccessRate: "99.8%",
      avgBackpressure: "1.2%",
    },
  },
  postgres: {
    name: "PostgreSQL",
    status: "Healthy",
    version: "16.4",
    database: "icestream_analytics",
    metrics: {
      activeConnections: 42,
      maxConnections: 100,
      dbSize: "2.4 GB",
      queriesPerSec: 156,
      cacheHitRatio: "99.4%",
      replicationLag: "4ms",
    },
  },
};

// ── Pipeline Topology Data ───────────────────────────────────────────────────

export const pipelineNodes = [
  { id: "producers", label: "Event Producers", type: "source", rate: "4.5k msg/s", latency: "1ms", status: "healthy" },
  { id: "kafka", label: "Kafka Cluster (3 Brokers)", type: "broker", rate: "4.3k msg/s", latency: "3ms", status: "healthy" },
  { id: "flink", label: "Flink Stream Engine", type: "processor", rate: "4.2k msg/s", latency: "12ms", status: "healthy" },
  { id: "validation", label: "Rules & Quality Engine", type: "validator", rate: "4.2k msg/s", latency: "8ms", status: "warning" },
  { id: "postgres", label: "PostgreSQL Sink", type: "storage", rate: "4.1k msg/s", latency: "5ms", status: "healthy" },
];

// ── Alerts & System Notifications ────────────────────────────────────────────

export const systemAlerts = [
  {
    id: "alt-001",
    timestamp: "12 mins ago",
    level: "warning",
    service: "Validation",
    message: "Schema mismatch rate spiked to 1.8% on topic 'transactions'",
  },
  {
    id: "alt-002",
    timestamp: "28 mins ago",
    level: "info",
    service: "Flink",
    message: "Checkpoint #4829 completed successfully (latency: 142ms)",
  },
  {
    id: "alt-003",
    timestamp: "1 hour ago",
    level: "info",
    service: "Kafka",
    message: "Partition rebalance completed for topic 'click-events'",
  },
];

// ── Throughput Time-Series ───────────────────────────────────────────────────

function generateThroughputData(points = 30) {
  const now = Date.now();
  const data = [];
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now - i * 60_000);
    const label = time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const base = 3800 + Math.sin(i * 0.4) * 600;
    const messagesIn = Math.round(base + Math.random() * 400);
    const messagesOut = Math.round(base * 0.92 + Math.random() * 300);
    const dropRate = Math.round(Math.random() * 15);
    data.push({ time: label, messagesIn, messagesOut, dropRate });
  }
  return data;
}

export const throughputData = generateThroughputData();

// ── Validation Metrics ──────────────────────────────────────────────────────

export const validationMetrics = {
  totalValidated: 128_450,
  passed: 125_200,
  failed: 1_830,
  warnings: 1_420,
  passRate: 97.5,
  schemaCompliance: 99.1,
  dataQuality: 95.8,
};

// ── Recent Events ───────────────────────────────────────────────────────────

const TOPICS = [
  "user-signups",
  "page-views",
  "transactions",
  "click-events",
  "session-starts",
  "api-calls",
  "error-logs",
  "notifications",
];

const STATUSES = ["success", "success", "success", "success", "warning", "error"];
const USERS = ["usr_9981", "usr_4412", "usr_1092", "usr_8823", "usr_7719"];

function generateEventId() {
  const chars = "abcdef0123456789";
  let id = "evt-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generatePayload(topic, status) {
  return {
    eventId: generateEventId(),
    topic,
    timestamp: new Date().toISOString(),
    status,
    meta: {
      clientIp: `192.168.1.${Math.floor(Math.random() * 254 + 1)}`,
      userId: USERS[Math.floor(Math.random() * USERS.length)],
      region: "us-east-1",
      datacenter: "dc-01",
    },
    data: {
      bytesProcessed: Math.floor(Math.random() * 4096 + 512),
      checksumValid: status !== "error",
      schemaVersion: "v2.1.0",
    },
  };
}

export function generateRecentEvents(count = 25) {
  const now = Date.now();
  const events = [];
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now - i * 3200 - Math.random() * 2000);
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const eventId = generateEventId();
    events.push({
      id: eventId,
      timestamp: timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      topic,
      status,
      latency: `${Math.floor(Math.random() * 180 + 5)}ms`,
      payload: generatePayload(topic, status),
    });
  }
  return events;
}

export const recentEvents = generateRecentEvents();

export const liveCounterSeed = {
  totalEvents: 1_284_503,
  eventsPerSecond: 4280,
};
