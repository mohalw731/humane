import { useAudioTranscriber, type TranscriptionHistoryItem } from "@/context/AudioTranscriberProvider";
import { ArrowUpFromLineIcon, Trophy } from "lucide-react";
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
  const [latestCallSummary, setLatestCallSummary] = useState<LatestCallSummary | null>(null);
  const [weeklyBestCall, setWeeklyBestCall] = useState<WeeklyBestCall | null>(null);

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
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Update latest call summary when history changes
  useEffect(() => {
    if (history.length > 0) {
      updateLatestCallSummary();
    } else {
      setLatestCallSummary(null);
    }
  }, [history]);

  // Update weekly best call when history changes or on Friday
  useEffect(() => {
    if (history.length > 0) {
      updateWeeklyBestCall();
    } else {
      setWeeklyBestCall(null);
    }

    // Set up Friday check
    const checkFriday = () => {
      const today = new Date();
      if (today.getDay() === 5) { // Friday
        updateWeeklyBestCall();
      }
    };

    // Check every day at midnight
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      checkFriday();
      setInterval(checkFriday, 86400000); // Check daily
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
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
          .map(strength => strength.title)
      : ["Inga styrkor identifierade"];

    const weaknesses = latestCall.analysis.weaknesses
      ? latestCall.analysis.weaknesses
          .slice(0, 3)
          .map(weakness => weakness.title)
      : ["Inga förbättringsområden identifierade"];

    setLatestCallSummary({
      strengths,
      weaknesses,
      lastUpdated: latestCall.timestamp
    });
  };

  const updateWeeklyBestCall = () => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();

    const thisWeeksCalls = history.filter(call => {
      const callDate = new Date(call.timestamp);
      return (
        getWeekNumber(callDate) === currentWeek && 
        callDate.getFullYear() === currentYear
      );
    });

    const bestCall = thisWeeksCalls.reduce<TranscriptionHistoryItem | null>((best, current) => {
      if (!current.analysis) return best;
      if (!best) return current;
      return (current.analysis.score > (best.analysis?.score || 0)) ? current : best;
    }, null);

    setWeeklyBestCall({
      call: bestCall,
      weekNumber: currentWeek,
      year: currentYear
    });
  };

  return (
    <section className="flex gap-4 lg:flex-nowrap flex-wrap-reverse md:items-start items-center md:justify-start justify-center mb-5 w-full">     
      {/* Week's Best Call Widget */}
      {weeklyBestCall?.call && (
        <div className="bg-[#FFD700] text-black h-52 md:max-w-xs w-full rounded-xl p-4 flex flex-col relative">
          <div className="absolute top-3 right-3 bg-black text-[#FFD700] rounded-full p-2">
            <Trophy size={20} />
          </div>
          
          <h3 className="font-bold text-lg mb-2">Veckans bästa samtal</h3>
          <p className="text-sm mb-1">Vecka {weeklyBestCall.weekNumber}, {weeklyBestCall.year}</p>
          
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="font-semibold text-md truncate">
              {weeklyBestCall.call.aiGeneratedTitle || "Ingen titel"}
            </h4>
            <p className="text-4xl font-bold my-2">
              {weeklyBestCall.call.analysis?.score.toFixed(1) || "N/A"}
            </p>
            <p className="text-xs">
              {weeklyBestCall.call.framework} • {weeklyBestCall.call.callType}
            </p>
          </div>

          <Link 
            href={`/dashboard/${weeklyBestCall.call.id}`}
            className="mt-2 text-sm font-medium text-black hover:underline self-end"
          >
            Visa detaljer →
          </Link>
        </div>
      )}

      {/* Average Rating */}
      <div className="bg-primary text-black h-52 md:max-w-52 w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-7xl">{averageRating?.toFixed(1) || "N/A"}</h2>
        <p>Genomsnittligt betyg</p>
      </div>

      {/* Call Count */}
      <div className="bg-[#C9DC87] text-black h-52 md:max-w-52 w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-7xl">{history.length || "N/A"}</h2>
        <p>Antal samtal</p>
      </div>

      {/* Most Used Playbook */}
      <div className="bg-[#ffdfba] text-black h-52 md:max-w-xs min-w-[200px] w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-6xl">{mostUsedPlaybook || "N/A"}</h2>
        <p>Mest använda playbook</p>
      </div>

      {/* Latest Call Summary */}
      {latestCallSummary && (
        <div className="bg-[#bae1ff] text-black h-52 md:max-w-xs w-full rounded-xl p-4 flex flex-col">
          <h3 className="font-bold text-lg mb-2">Senaste samtalet</h3>
          <div className="flex-1 overflow-y-auto">
            <div className="mb-3">
              <h4 className="font-semibold text-sm">3 saker du gjorde bra:</h4>
              <ul className="text-xs list-disc pl-5">
                {latestCallSummary.strengths.map((item, i) => (
                  <li key={`strength-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="mb-3">
              <h4 className="font-semibold text-sm">3 saker att förbättra:</h4>
              <ul className="text-xs list-disc pl-5">
                {latestCallSummary.weaknesses.map((item, i) => (
                  <li key={`weakness-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-1">
            {latestCallSummary.lastUpdated.toLocaleDateString('sv-SE')}
          </p>
        </div>
      )}

      {/* Upload Call */}
      <div className="bg-[#18181b] text-white md:max-w-sm h-52 w-full rounded-xl py-10 px-6 flex flex-col items-start border border-[#1E1F21]">
        <span className="text-xl mb-2">Ladda upp ett samtal</span>
        <p className="text-sm text-gray-500">
          Ladda upp ett samtal och få en rekommendation på vad du ska göra
        </p>
        <button
          onClick={() => setShowUploadModal(true)}
          className="my-7 flex items-center gap-3 bg-secondary text-black px-4 py-2 rounded-xl text-md"
        >
          Ladda upp <ArrowUpFromLineIcon className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}