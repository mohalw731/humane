"use client";
import { useState, useMemo } from "react";
import { useAudioTranscriber } from "@/context/AudioTranscriberProvider";

interface TranscriptionHistoryItem {
  id: string;
  timestamp: Date;
  language: string;
  audioName: string;
  rawText: string;
  userId?: string;
  aiGeneratedTitle?: string;
  callType: string;
  framework: string;
  analysis?: {
    score: number;
    scoreExplanation: string;
    frameworkEvaluation: string;
  };
}

interface CallChartProps {
  calls: TranscriptionHistoryItem[];
}

type DataPoint = {
  date: Date;
  count: number;
  avgScore: number;
};

export function CallChart({ calls }: CallChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const data = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const dataPoints = new Map<string, DataPoint>();

    // Initialize all months with 0 counts
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      dataPoints.set(`${currentYear}-${month + 1}`, {
        date,
        count: 0,
        avgScore: 0,
      });
    }

    // Process each call
    calls.forEach((call) => {
      const date = new Date(call.timestamp);
      if (date.getFullYear() === currentYear) {
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const existing = dataPoints.get(key) || {
          date,
          count: 0,
          avgScore: 0,
        };
        const newCount = existing.count + 1;
        const callScore = call.analysis?.score || 0;
        const newAvgScore =
          (existing.avgScore * existing.count + callScore) / newCount;

        dataPoints.set(key, {
          date,
          count: newCount,
          avgScore: Number(newAvgScore.toFixed(1)),
        });
      }
    });

    return Array.from(dataPoints.values());
  }, [calls]);

  const allTimeAvgScore = useMemo(() => {
    if (calls.length === 0) return 0;
    const sum = calls.reduce((acc, curr) => acc + (curr.analysis?.score || 0), 0);
    return Number((sum / calls.length).toFixed(1));
  }, [calls]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const calculateHeight = (count: number) => {
    const minHeight = 4;
    const maxHeight = 100;
    const height = Math.max((count / maxCount) * maxHeight, minHeight);
    return `${height}px`;
  };

  return (
    <div className="w-full max-w-5xl max-h-[500px] rounded-xl overflow-hidden bg-[#E0B9E0]">
      <div className="p-6 space-y-6">
        <div className="flex items-baseline gap-2 flex-col">
          <h2 className="text-sm text-slate-600">All-Time Average Score</h2>
          <p className="text-6xl text-[#202020]">
            {allTimeAvgScore}
          </p>
        </div>

        <div className="h-[140px] relative">
          <div className="absolute inset-0 flex items-end gap-1">
            {data.map((point, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <div className="w-full relative flex-grow">
                  <div
                    className="w-full bg-[#202020] rounded-xl transition-all absolute bottom-0"
                    style={{
                      height: calculateHeight(point.count),
                    }}
                  />
                  {hoveredPoint === point && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-lg p-2 z-10 mb-2 whitespace-nowrap">
                      <div className="text-xs">
                        <p className="font-medium">
                          {point.date.toLocaleDateString("en-US", {
                            month: "long",
                          })}
                        </p>
                        <p className="text-gray-500">
                          {point.count} call{point.count !== 1 ? "s" : ""} uploaded
                        </p>
                        <p className="text-gray-500">
                          Avg score: {point.avgScore || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-2">
                  {point.date.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </div>
  );
}

