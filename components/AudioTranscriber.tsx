"use client";

import { useAudioTranscriber } from "../context/AudioTranscriberProvider";
import {
  FiX,
  FiTrash2,
  FiSend,
  FiUpload,
  FiMessageSquare,
  FiFileText,
  FiBarChart2,
} from "react-icons/fi";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AudioTranscriber() {
  const {
    isUploading,
    history,
    settings,
    setShowUploadModal,
    deleteTranscription,
    formatDate,
    getFrameworkName,
    getCallTypeName,
    updateTitle,
  } = useAudioTranscriber();
  const router = useRouter();

  // Add a function to render skeleton cards when uploading
  const renderSkeletonCards = () => {
    return Array(1)
      .fill(0)
      .map((_, index) => (
        <Card
          key={`skeleton-${index}`}
          className="bg-[#141414] border-[#1E1F21] overflow-hidden"
        >
          <div className="p-4 h-40">
            <Skeleton className="h-6 w-3/4 mb-2 bg-[#2d2d30]" />
            <Skeleton className="h-4 w-1/3 mb-3 bg-[#2d2d30]" />
          </div>
        </Card>
      ));
  };

  return (
    <div className=" bg-[#121212] text-gray-200 w-full">
      <div className="w-full">
        {/* History Cards */}
        <div className="mb-8">
          {history.length === 0 && !isUploading ? (
            <div className="text-center py-12 bg-[#1e1e1e] rounded-lg border border-[#333]">
              <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">Ingen samtalshistorik ännu</p>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ladda upp ditt första samtal
              </Button>
            </div>
          ) : (
            <div className="">
              {isUploading && renderSkeletonCards()}

              <div className=" bg-[#18181b] p-4 rounded-lg border border-[#1E1F21] grid gap-2 w-full">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    className="border border-[#1E1F21]  rounded-xl p-2 bg-[#141414] cursor-pointer  transition-colors overflow-hidden w-full"
                    onClick={() => router.push(`/dashboard/${item.id}`)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg text-white line-clamp-1">
                          {item.aiGeneratedTitle || item.audioName}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTranscription(item.id);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-[#2a2a2a]"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newTitle = prompt(
                                settings.language === "sv"
                                  ? "Redigera titel"
                                  : "Edit title",
                                item.aiGeneratedTitle || item.audioName
                              );
                              if (
                                newTitle !== null &&
                                newTitle !== item.aiGeneratedTitle
                              ) {
                                updateTitle(item.id, newTitle);
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-[#2a2a2a]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        {formatDate(item.timestamp)}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="bg-[#2a2a2a] text-blue-300 border-[#333]"
                        >
                          {item.language === "sv" ? "Svenska" : "English"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-[#2a2a2a] text-green-300 border-[#333]"
                        >
                          {getCallTypeName(item.callType)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-[#2a2a2a] text-purple-300 border-[#333]"
                        >
                          {getFrameworkName(item.framework)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
