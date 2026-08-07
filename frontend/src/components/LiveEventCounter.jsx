import { useState, useEffect, useRef } from "react";
import { Activity, TrendingUp } from "lucide-react";
import { liveCounterSeed } from "../data/dummyData";

export default function LiveEventCounter() {
  const [count, setCount] = useState(liveCounterSeed.totalEvents);
  const [rate, setRate] = useState(liveCounterSeed.eventsPerSecond);
  const [sparkline, setSparkline] = useState(() =>
    Array.from({ length: 20 }, () => 40 + Math.random() * 60)
  );
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // Simulate live event count increasing
      const increment = Math.floor(Math.random() * 120 + 30);
      setCount((prev) => prev + increment);

      // Fluctuate rate slightly
      setRate(Math.floor(liveCounterSeed.eventsPerSecond + (Math.random() - 0.5) * 600));

      // Shift sparkline
      setSparkline((prev) => {
        const next = [...prev.slice(1), 30 + Math.random() * 70];
        return next;
      });
    }, 1500);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="card live-counter-card" id="live-event-counter">
      <div className="card-title">
        <Activity
          size={14}
          style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}
        />
        Live Events
      </div>

      <div className="live-counter-value">{count.toLocaleString()}</div>

      <div className="live-counter-rate">
        <TrendingUp size={16} />
        {rate.toLocaleString()} events/sec
      </div>

      <div className="live-counter-sparkline">
        {sparkline.map((h, i) => (
          <div
            className="sparkline-bar"
            key={i}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
