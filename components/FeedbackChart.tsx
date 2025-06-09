"use client";
import { useState, useMemo } from "react";
import { useAudioTranscriber } from "@/context/AudioTranscriberProvider";
import { Trophy } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";

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

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

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
    const sum = calls.reduce(
      (acc, curr) => acc + (curr.analysis?.score || 0),
      0
    );
    return Number((sum / calls.length).toFixed(1));
  }, [calls]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const calculateHeight = (count: number) => {
    const minHeight = 4;
    const maxHeight = 100;
    const height = Math.max((count / maxCount) * maxHeight, minHeight);
    return `${height}px`;
  };

  const weeklyBestCall = useMemo(() => {
    // Prevent hydration mismatch by checking if we're on client
    if (typeof window === "undefined") {
      return { call: null, weekNumber: 1, year: new Date().getFullYear() };
    }

    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();

    const thisWeeksCalls = calls.filter((call) => {
      // Handle both Date and string timestamps
      const callDate =
        call.timestamp instanceof Date
          ? call.timestamp
          : new Date(call.timestamp);
      return (
        getWeekNumber(callDate) === currentWeek &&
        callDate.getFullYear() === currentYear
      );
    });

    const bestCall = thisWeeksCalls.reduce<TranscriptionHistoryItem | null>(
      (best, current) => {
        if (!current.analysis) return best;
        if (!best) return current;
        return current.analysis.score > (best.analysis?.score || 0)
          ? current
          : best;
      },
      null
    );

    return {
      call: bestCall,
      weekNumber: currentWeek,
      year: currentYear,
    };
  }, [calls]);

  return (
    <div className="flex gap-4 mb-4 md:flex-nowrap flex-wrap justify-between items-start w-full">
      <div className="w-full h-[450px] rounded-xl overflow-hidden bg-[#E0B9E0]">
        <div className="p-6 space-y-6">
          <div className="flex items-baseline gap-2 flex-col">
            <h2 className="text-sm text-slate-600">All-Time Average Score</h2>
            <p className="text-6xl text-[#202020]">{allTimeAvgScore}</p>
          </div>

          <div className="h-[280px] relative">
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
                            {point.count} call{point.count !== 1 ? "s" : ""}{" "}
                            uploaded
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


       {/* Week's Best Call Component */}
      {weeklyBestCall.call && (
        <ScrollArea  className="bg-[#18181B] border border-[#1E1F21] rounded-2xl p-4 shadow-lg max-w-lg  w-full max-h-[450px] hover:overflow-y-auto overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Veckans bästa samtal</h3>
              <p className="text-sm text-gray-400">
                Vecka {weeklyBestCall.weekNumber}, {weeklyBestCall.year}
              </p>
            </div>
          </div>

          <div className="">
            {/* Score */}
            <div className="bg-[#141414] border border-[#1E1F21] rounded-xl p-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-1">{weeklyBestCall.call.analysis?.score.toFixed(1)}</p>
                <p className="text-sm text-gray-400">Betyg</p>
              </div>
            </div>

            {/* Call Details */}
            <div className="bg-[#141414] border border-[#1E1F21] rounded-xl p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Samtal</p>
                  <p className="text-white font-medium truncate">
                    {weeklyBestCall.call.aiGeneratedTitle || weeklyBestCall.call.audioName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Datum</p>
                  <p className="text-white text-sm">
                    {new Date(weeklyBestCall.call.timestamp).toLocaleDateString("sv-SE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Framework */}
            <div className="bg-[#141414] border border-[#1E1F21] rounded-xl p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Framework</p>
                  <p className="text-white font-medium">{weeklyBestCall.call.framework}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Typ</p>
                  <p className="text-white text-sm">{weeklyBestCall.call.callType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Explanation */}
          {weeklyBestCall.call.analysis?.scoreExplanation && (
            <div className="mt-6 bg-[#141414] border border-[#1E1F21] rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Bedömning</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{weeklyBestCall.call.analysis.scoreExplanation}</p>
            </div>
          )}
        </ScrollArea>
      )}

      {/* No calls this week message */}
      {!weeklyBestCall.call && (
        <div className="bg-[#18181b] border border-[#1E1F21] rounded-2xl p-6 text-center max-w-lg w-full  flex-col items-center justify-center mx-auto md:flex hidden md:h-[456px] ">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Inga samtal denna vecka</h3>
          <p className="text-gray-400 text-sm">
            Ladda upp ditt första samtal för vecka {weeklyBestCall.weekNumber} för att se det här.
          </p>
        </div>
      )}
    </div>
  );
}
