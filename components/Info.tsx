import { useAudioTranscriber } from "@/context/AudioTranscriberProvider";
import { ArrowUpFromLineIcon, File, Plus } from "lucide-react";
import React from "react";

export interface TranscriptionHistoryItem {
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

export default function Info() {
  const { history, setShowUploadModal } = useAudioTranscriber();



  // Calculate overall average rating
  const averageRating =
    history.length > 0
      ? history.reduce(
          (sum: number, item: TranscriptionHistoryItem) =>
            sum + (item.analysis?.score || 0),
          0
        ) / history.length
      : null;

  // Get most used playbook
  const playbookCounts = history.reduce(
    (counts: Record<string, number>, item: TranscriptionHistoryItem) => {
      const framework = item.framework;
      counts[framework] = (counts[framework] || 0) + 1;
      return counts;
    },
    {}
  );

  const mostUsedPlaybook =
    Object.keys(playbookCounts).length > 0
      ? Object.entries(playbookCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      : null;

  return (
    <section className="flex gap-4 flex-wrap-reverse md:items-start items-center md:justify-start justify-center mb-5 ">

          <div className="bg-secondary text-black md:size-52 h-52 w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-7xl">{history.length || "N/A"}</h2>
        <p>Uploaded calls</p>
      </div>

            <div className="bg-primary text-black md:size-52 h-52 w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-7xl">
          {typeof averageRating === "number" ? averageRating.toFixed(1) : "N/A"}
        </h2>
        <p>Overall rating</p>
      </div>

      
      <div className="bg-[#ffdfba] text-black md:size-52 h-52 w-full rounded-xl flex flex-col items-center justify-center">
        <h2 className="text-7xl">{mostUsedPlaybook || "N/A"}</h2>
        <p>Most used playbook</p>
      </div>


    

      <div className="bg-[#18181b] text-white md:w-96 h-52 w-full rounded-xl py-10 px-6 flex flex-col items-start  border border-[#1E1F21]">
        <span className="text-xl mb-2">Ladda upp ett samtal</span>
        <p className="text-sm text-gray-500">Ladda upp ett samtal och få en rekommendation på vad du ska göra</p>
        <button
            onClick={() => setShowUploadModal(true)}
            className=" my-7 flex items-center  gap-3 bg-secondary text-black px-4 py-2  rounded-xl text-md"
          >
            Ladda upp <ArrowUpFromLineIcon className="w-4 h-4" />
          </button>
      </div>
    </section>
  );
}
