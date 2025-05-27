import { useAudioTranscriber, type TranscriptionHistoryItem } from "@/context/AudioTranscriberProvider";
import { ArrowUpFromLineIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

interface LatestCallSummary {
  strengths: string[];
  weaknesses: string[];
  lastUpdated: Date;
}

export default function Info() {
  const { history, setShowUploadModal } = useAudioTranscriber();
  const [latestCallSummary, setLatestCallSummary] = useState<LatestCallSummary | null>(null);

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

  // Update summary when history changes
  useEffect(() => {
    if (history.length > 0) {
      updateLatestCallSummary();
    } else {
      setLatestCallSummary(null);
    }
  }, [history]);

  const updateLatestCallSummary = () => {
    const latestCall = history[0]; // Get the most recent call (history is sorted by date)
    
    if (!latestCall.analysis) {
      setLatestCallSummary(null);
      return;
    }

    // Get top 3 strengths from latest call
    const strengths = latestCall.analysis.strengths
      ? latestCall.analysis.strengths
          .slice(0, 3)
          .map(strength => strength.title)
      : ["Inga styrkor identifierade"];

    // Get top 3 weaknesses from latest call
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

  return (
    <section className="flex gap-4 lg:flex-nowrap flex-wrap-reverse md:items-start items-center md:justify-start justify-center mb-5 w-full">     
      <div className="bg-primary text-black h-52 md:max-w-52 w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-7xl">{averageRating?.toFixed(1) || "N/A"}</h2>
        <p>Genomsnittligt betyg</p>
      </div>

      <div className="bg-[#C9DC87] text-black h-52 md:max-w-52 w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-7xl">{history.length || "N/A"}</h2>
        <p>Antal samtal</p>
      </div>

      <div className="bg-[#ffdfba] text-black h-52 md:max-w-xs min-w-[200px] w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-6xl">{mostUsedPlaybook || "N/A"}</h2>
        <p>Mest använda playbook</p>
      </div>

      {/* Latest Call Summary Card - Only shown when there are calls */}
      {latestCallSummary && (
        <div className="bg-[#bae1ff] text-black md:max-w-xs w-full rounded-xl p-4 flex flex-col">
          <h3 className=" text-lg mb-2">Sammanfattning från senaste samtalet</h3>
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