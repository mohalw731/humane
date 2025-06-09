import {
  useAudioTranscriber,
  type TranscriptionHistoryItem,
} from "@/context/AudioTranscriberProvider";
import {
  ArrowUpFromLineIcon,
  Trophy,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface LatestCallSummary {
  strengths: string[];
  weaknesses: string[];
  lastUpdated: Date;
}

interface WeeklyBestCall {
  call: TranscriptionHistoryItem | null;
  weekNumber: number;
  year: number;
}

export default function Info() {
  const { history, setShowUploadModal } = useAudioTranscriber();
  const [latestCallSummary, setLatestCallSummary] =
    useState<LatestCallSummary | null>(null);
  const [weeklyBestCall, setWeeklyBestCall] = useState<WeeklyBestCall | null>(
    null
  );
  const [monthlyStats, setMonthlyStats] = useState({
    currentMonthCalls: 0,
    prevMonthCalls: 0,
    currentMonthAvg: 0,
    prevMonthAvg: 0,
    currentWeekCalls: 0,
    prevWeekCalls: 0,
  });

  // Calculate overall average rating
  const averageRating =
    history.length > 0
      ? history.reduce<number>(
          (sum, item) => sum + (item.analysis?.score || 0),
          0
        ) / history.length
      : null;

  // Get most used playbook
  const playbookCounts = history.reduce<Record<string, number>>(
    (counts, item) => {
      const framework = item.framework;
      counts[framework] = (counts[framework] || 0) + 1;
      return counts;
    },
    {}
  );

  const mostUsedPlaybook =
    Object.keys(playbookCounts).length > 0
      ? Object.entries(playbookCounts).reduce((a, b) =>
          b[1] > a[1] ? b : a
        )[0]
      : null;

  // Get current week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Calculate monthly and weekly stats
  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);

    // Previous month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    // Previous week
    let prevWeek = currentWeek - 1;
    let prevWeekYear = currentYear;
    if (prevWeek < 1) {
      prevWeek = 52;
      prevWeekYear--;
    }

    const currentMonthCalls = history.filter((call) => {
      const callDate = new Date(call.timestamp);
      return (
        callDate.getMonth() === currentMonth &&
        callDate.getFullYear() === currentYear
      );
    });

    const prevMonthCalls = history.filter((call) => {
      const callDate = new Date(call.timestamp);
      return (
        callDate.getMonth() === prevMonth && callDate.getFullYear() === prevYear
      );
    });

    const currentWeekCalls = history.filter((call) => {
      const callDate = new Date(call.timestamp);
      return (
        getWeekNumber(callDate) === currentWeek &&
        callDate.getFullYear() === currentYear
      );
    });

    const prevWeekCalls = history.filter((call) => {
      const callDate = new Date(call.timestamp);
      return (
        getWeekNumber(callDate) === prevWeek &&
        callDate.getFullYear() === prevWeekYear
      );
    });

    const currentMonthAvg =
      currentMonthCalls.length > 0
        ? currentMonthCalls.reduce(
            (sum, item) => sum + (item.analysis?.score || 0),
            0
          ) / currentMonthCalls.length
        : 0;

    const prevMonthAvg =
      prevMonthCalls.length > 0
        ? prevMonthCalls.reduce(
            (sum, item) => sum + (item.analysis?.score || 0),
            0
          ) / prevMonthCalls.length
        : 0;

    setMonthlyStats({
      currentMonthCalls: currentMonthCalls.length,
      prevMonthCalls: prevMonthCalls.length,
      currentMonthAvg,
      prevMonthAvg,
      currentWeekCalls: currentWeekCalls.length,
      prevWeekCalls: prevWeekCalls.length,
    });
  };

  // Update stats when history changes
  useEffect(() => {
    calculateStats();

    if (history.length > 0) {
      updateLatestCallSummary();
      updateWeeklyBestCall();
    } else {
      setLatestCallSummary(null);
      setWeeklyBestCall(null);
    }
  }, [history]);

  const updateLatestCallSummary = () => {
    const latestCall = history[0];

    if (!latestCall?.analysis) {
      setLatestCallSummary(null);
      return;
    }

    const strengths = latestCall.analysis.strengths
      ? latestCall.analysis.strengths
          .slice(0, 3)
          .map((strength) => strength.title)
      : ["Inga styrkor identifierade"];

    const weaknesses = latestCall.analysis.weaknesses
      ? latestCall.analysis.weaknesses
          .slice(0, 3)
          .map((weakness) => weakness.title)
      : ["Inga förbättringsområden identifierade"];

    setLatestCallSummary({
      strengths,
      weaknesses,
      lastUpdated: latestCall.timestamp,
    });
  };

  const updateWeeklyBestCall = () => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();

    const thisWeeksCalls = history.filter((call) => {
      const callDate = new Date(call.timestamp);
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

    setWeeklyBestCall({
      call: bestCall,
      weekNumber: currentWeek,
      year: currentYear,
    });
  };

  // Helper function to calculate absolute difference
  const getAbsoluteDifference = (current: number, previous: number) => {
    return current - previous;
  };

  // Helper function to render week difference indicator
  const renderWeekDifference = (current: number, previous: number) => {
    const difference = getAbsoluteDifference(current, previous);

    if (previous === 0) return null;

    return (
      <span
        className={`flex items-center text-lg ${
          difference >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {difference >= 0 ? "+" : ""}
        {difference}
      </span>
    );
  };

  // Helper function to render trend indicator
  const renderTrend = (current: number, previous: number) => {
    const percentage = ((current - previous) / previous) * 100;
    const isPositive = percentage >= 0;

    if (previous === 0) return null;

    return (
      <span
        className={`flex items-center text-lg ${
          isPositive ? "text-green-700" : "text-red-500"
        }`}
      >
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(Math.round(percentage))}%
      </span>
    );
  };

  return (
    <section className="flex gap-4 lg:flex-nowrap flex-wrap-reverse md:items-start items-center md:justify-start justify-center mb-5 w-full">
      {/* Average Rating (This Month) */}
      <div className="bg-secondary p-5 text-black  w-full rounded-xl flex flex-col  relative">
        <p>Månadens genomsnittligt betyg</p>

        <h2 className="text-7xl py-6">
          {monthlyStats.currentMonthAvg.toFixed(1)}
        </h2>
        {monthlyStats.prevMonthAvg > 0 && (
          
          <div className="absolute bottom-3 flex items-center gap-2">
            <span>Senaste månaden</span>
            {renderTrend(
              monthlyStats.currentMonthAvg,
              monthlyStats.prevMonthAvg
            )}
          </div>
        )}
      </div>

      {/* Total Calls */}
      <div className="bg-[#F6D6C9] p-5 text-black  w-full rounded-xl flex flex-col  relative">
        <p>Totalt antal samtal</p>

        <h2 className="text-7xl py-6">{history.length}</h2>
        {monthlyStats.prevMonthCalls > 0 && (
          <div className="absolute bottom-3 flex items-center gap-2">
            <span>Senaste månaden</span>
            {renderTrend(history.length, monthlyStats.prevMonthCalls)}
          </div>
        )}
      </div>

      {/* This Week Calls */}
      <div className="bg-[#C9E4C5] p-5 text-black  w-full rounded-xl flex flex-col  relative">
        <div className="">
          <p>Denna veckas samtal</p>

          <h2 className="text-7xl py-6">{monthlyStats.currentWeekCalls}</h2>
        </div>
        {monthlyStats.prevWeekCalls > 0 && (
          <div className="absolute bottom-3 flex items-center gap-2">
            <span>Senaste veckan</span>
            {renderWeekDifference(
              monthlyStats.currentWeekCalls,
              monthlyStats.prevWeekCalls
            )}
          </div>
        )}
      </div>

      {/* Most Used Playbook */}
      <div className="bg-[#F9E6B3] p-4 text-black  w-full rounded-xl flex flex-col  relative">
        <p>Mest använda playbook</p>

        <h2 className="text-6xl py-8">{mostUsedPlaybook || "N/A"}</h2>
      </div>

     

    </section>
  );
}
