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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AudioTranscriber() {
  const {
    audioFile,
    isUploading,
    history,
    selectedHistoryItem,
    activeTab,
    showSettings,
    settings,
    isDeleting,
    chatMessage,
    isSendingChat,
    chatContainerRef,
    fileInputRef,
    showUploadModal,
    isDragging,
    showDeleteConfirmation,
    itemToDelete,
    recommendedQuestions,
    isTextareaExpanded,
    setActiveTab,
    setShowSettings,
    setChatMessage,
    setShowUploadModal,
    setIsTextareaExpanded,
    handleFileChange,
    transcribeAudio,
    deleteTranscription,
    confirmDeleteTranscription,
    handleSettingsChange,
    openHistoryModal,
    closeModal,
    handleChatSubmit,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    useRecommendedQuestion,
    handleKeyDown,
    formatTime,
    formatDate,
    getFrameworkName,
    getCallTypeName,
    setAudioFile,
    setShowDeleteConfirmation,
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

  const handleRecommendedQuestionClick = (questionText: string) => {
    useRecommendedQuestion(questionText);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 ">
      <div className="">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isUploading && renderSkeletonCards()}

              {history.map((item) => (
                <Card
                  key={item.id}
                  className="border border-[#1E1F21]  rounded-lg p-2 bg-[#141414] cursor-pointer  transition-colors overflow-hidden"
                  // onClick={() => openHistoryModal(item)}
                    onClick={() => router.push(`/dashboard/${item.id}`)}

                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg text-white line-clamp-1">
                        {item.aiGeneratedTitle || item.audioName}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTranscription(item.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-[#2a2a2a]"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
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
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 z-50 ">
            <div className="Shadow-xl w-full max-w-md flex flex-col   border border-[#1E1F21] rounded-lg p-2 mt-6 bg-[#141414]">
              <div className="p-3  flex justify-between items-center">
                <h2 className="text-xl text-white ">
                  Ladda upp samtal
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-full hover:bg-[#2a2a2a] text-primary"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-500 bg-opacity-10"
                      : "border-[#333] hover:border-blue-500 hover:bg-blue-500 hover:bg-opacity-5"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <div className="flex flex-col items-center">
                    <FiUpload className="w-12 h-12 mb-4 text-blue-500" />
                    <p className="text-gray-300 mb-2">
                      Dra och släpp din ljudfil här
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      eller klicka för att bläddra
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                      id="audio-file-input"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
  
                      className=""
                    >
                      Välj fil
                    </button>
                  </div>
                </div>

                {audioFile && (
                  <div className="p-3 rounded-lg mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                        <FiFileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="truncate">
                        <p className="text-white truncate">{audioFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAudioFile(null)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={transcribeAudio}
                  disabled={!audioFile || isUploading}
                  className="w-full p-2 text-md bg-primary text-black rounded-xl  flex items-center justify-center"
                >
                  {isUploading ? <Loader2 className=" h-4 w-4 animate-spin text-center" /> : "Ladda upp samtal"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-3 z-50">
            <div className=" rounded-lg p-2 bg-[#18181B] w-full max-w-md">
              <div className=" p-3  flex justify-between items-center">
                <h2 className="text-xl  text-white">
                  Bekräfta borttagning
                </h2>
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="p-2 rounded-full hover:bg-[#2a2a2a] text-primary"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 text-start flex items-end flex-col">
                <p className="text-gray-300 mb-6">
                  Är du säker på att du vill ta bort detta samtal? Denna åtgärd
                  kan inte ångras.
                </p>

                  <Button
                    onClick={confirmDeleteTranscription}
                    disabled={isDeleting === itemToDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting === itemToDelete ? <Loader2 className=" h-4 w-4 animate-spin" /> : "Ta bort"}
                  </Button>
                </div>
              </div>
            </div>
        )}

        {/* Transcription Modal */}
        {selectedHistoryItem && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1e1e1e] rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-[#333]">
              <div className="p-4 border-b border-[#333] flex justify-between items-center">
                <h2 className="text-xl font-bold truncate text-white">
                  {selectedHistoryItem.aiGeneratedTitle ||
                    selectedHistoryItem.audioName}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteTranscription(selectedHistoryItem.id)}
                    disabled={isDeleting === selectedHistoryItem.id}
                    className="p-2 rounded-full hover:bg-[#2a2a2a] text-red-400"
                    aria-label="Radera"
                  >
                    {isDeleting === selectedHistoryItem.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <FiTrash2 className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full hover:bg-[#2a2a2a] text-gray-300"
                    aria-label="Stäng"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as any)}
                className="flex-1 flex flex-col"
              >
                <div className="border-b border-[#333]">
                  <div className="flex bg-[#1a1a1a]">
                    <button
                      onClick={() => setActiveTab("analysis")}
                      className={`flex items-center px-6 py-3 border-b-2 ${
                        activeTab === "analysis"
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <FiBarChart2 className="w-4 h-4 mr-2" />
                      Analys
                    </button>
                    <button
                      onClick={() => setActiveTab("chat")}
                      className={`flex items-center px-6 py-3 border-b-2 ${
                        activeTab === "chat"
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <FiMessageSquare className="w-4 h-4 mr-2" />
                      Coach-chatt
                    </button>
                    <button
                      onClick={() => setActiveTab("transcription")}
                      className={`flex items-center px-6 py-3 border-b-2 ${
                        activeTab === "transcription"
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <FiFileText className="w-4 h-4 mr-2" />
                      Transkription
                    </button>
                  </div>
                </div>

                <TabsContent
                  value="transcription"
                  className="flex-1 overflow-hidden m-0 p-0 border-none"
                >
                  <ScrollArea className="h-[calc(90vh-10rem)]">
                    <div className="p-6">
                      <div className="text-sm text-gray-400 mb-4 flex flex-wrap gap-x-6 gap-y-2">
                        <p>
                          <span className="text-gray-500">Språk: </span>
                          <span className="text-white">
                            {selectedHistoryItem.language === "sv"
                              ? "Svenska"
                              : "English"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Datum: </span>
                          <span className="text-white">
                            {formatDate(selectedHistoryItem.timestamp)}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Samtalstyp: </span>
                          <span className="text-white">
                            {getCallTypeName(selectedHistoryItem.callType)}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Ramverk: </span>
                          <span className="text-white">
                            {getFrameworkName(selectedHistoryItem.framework)}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {selectedHistoryItem.transcription.map(
                          (segment, index) => (
                            <div
                              key={index}
                              className="p-4 rounded-xl bg-[#2a2a2a] max-w-[80%] self-start"
                            >
                              <div className="text-xs text-gray-400 mb-1 flex justify-between">
                                <span>{segment.speaker}</span>
                                <span>
                                  {formatTime(segment.start)} -{" "}
                                  {formatTime(segment.end)}
                                </span>
                              </div>
                              <div className="text-white">{segment.text}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="analysis"
                  className="flex-1 overflow-hidden m-0 p-0 border-none"
                >
                  <ScrollArea className="h-[calc(90vh-10rem)]">
                    <div className="p-6">
                      {selectedHistoryItem.analysis ? (
                        <div className="space-y-6">
                          {/* Score Section */}
                          <div className="bg-[#2a2a2a] p-6 rounded-lg">
                            <h3 className="text-lg font-medium mb-3 text-white">
                              Sammanfattande bedömning
                            </h3>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-5xl font-bold text-blue-400">
                                {selectedHistoryItem.analysis.score}/10
                              </div>
                              <div className="flex-1">
                                <div className="h-3 w-full bg-[#333] rounded-full overflow-hidden mb-2">
                                  <div
                                    className="h-full bg-blue-500"
                                    style={{
                                      width: `${
                                        (selectedHistoryItem.analysis.score /
                                          10) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-white">
                              {selectedHistoryItem.analysis.scoreExplanation}
                            </div>
                          </div>

                          {/* Summary Section */}
                          <div className="bg-[#2a2a2a] p-6 rounded-lg">
                            <h3 className="text-lg font-medium mb-3 text-white">
                              Sammanfattning
                            </h3>
                            <div className="text-white">
                              {selectedHistoryItem.analysis.summary}
                            </div>
                          </div>

                          {/* Strengths Section */}
                          {selectedHistoryItem.analysis.strengths.length >
                            0 && (
                            <div className="bg-[#2a2a2a] p-6 rounded-lg">
                              <h3 className="text-lg font-medium mb-3 text-white">
                                Styrkor
                              </h3>
                              <div className="space-y-3">
                                {selectedHistoryItem.analysis.strengths.map(
                                  (item, i) => (
                                    <div
                                      key={i}
                                      className="bg-[#333] p-4 rounded-lg"
                                    >
                                      <h4 className="font-medium text-blue-300 mb-2">
                                        {item.title}
                                      </h4>
                                      <p className="text-white">
                                        {item.description}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Weaknesses Section */}
                          {selectedHistoryItem.analysis.weaknesses.length >
                            0 && (
                            <div className="bg-[#2a2a2a] p-6 rounded-lg">
                              <h3 className="text-lg font-medium mb-3 text-white">
                                Förbättringsområden
                              </h3>
                              <div className="space-y-3">
                                {selectedHistoryItem.analysis.weaknesses.map(
                                  (item, i) => (
                                    <div
                                      key={i}
                                      className="bg-[#333] p-4 rounded-lg"
                                    >
                                      <h4 className="font-medium text-orange-300 mb-2">
                                        {item.title}
                                      </h4>
                                      <p className="text-white">
                                        {item.suggestion}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Lost Moments Section */}
                          {selectedHistoryItem.analysis.lostMoments.length >
                            0 && (
                            <div className="bg-[#2a2a2a] p-6 rounded-lg">
                              <h3 className="text-lg font-medium mb-3 text-white">
                                Kritiska ögonblick
                              </h3>
                              <div className="space-y-3">
                                {selectedHistoryItem.analysis.lostMoments.map(
                                  (item, i) => (
                                    <div
                                      key={i}
                                      className="bg-[#333] p-4 rounded-lg"
                                    >
                                      <div className="flex justify-between mb-2">
                                        <h4 className="font-medium text-red-300">
                                          {item.time}
                                        </h4>
                                      </div>
                                      <p className="text-white">
                                        {item.description}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Framework Evaluation */}
                          {selectedHistoryItem.analysis.frameworkEvaluation && (
                            <div className="bg-[#2a2a2a] p-6 rounded-lg">
                              <h3 className="text-lg font-medium mb-3 text-white">
                                Ramverksutvärdering
                              </h3>
                              <p className="text-white">
                                {
                                  selectedHistoryItem.analysis
                                    .frameworkEvaluation
                                }
                              </p>
                            </div>
                          )}

                          {/* Recommendations */}
                          {selectedHistoryItem.analysis.recommendations.length >
                            0 && (
                            <div className="bg-[#2a2a2a] p-6 rounded-lg">
                              <h3 className="text-lg font-medium mb-3 text-white">
                                Rekommendationer
                              </h3>
                              <div className="space-y-3">
                                {selectedHistoryItem.analysis.recommendations.map(
                                  (item, i) => (
                                    <div
                                      key={i}
                                      className="bg-[#333] p-4 rounded-lg"
                                    >
                                      <h4 className="font-medium text-green-300 mb-2">
                                        {item?.action || ""}
                                      </h4>
                                      <p className="text-white">
                                        {item.benefit}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          Ingen analys tillgänglig för detta samtal
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="chat"
                  className="flex-1 flex flex-col overflow-hidden m-0 p-0 border-none"
                >
                  {/* Chat messages container with scroll */}
                  <ScrollArea
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto px-6 py-4"
                    style={{ maxHeight: "calc(100vh - 380px)" }} // Adjust this value as needed
                  >
                    <div className="space-y-4">
                      {selectedHistoryItem?.chatMessages?.length || 0 > 0 ? (
                        selectedHistoryItem?.chatMessages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-4 rounded-lg ${
                                message.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-[#2a2a2a] text-white"
                              }`}
                            >
                              <Markdown>{message.content}</Markdown>
                              <p className="text-xs mt-2 opacity-70">
                                {formatDate(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          Ställ frågor till din AI-coach om detta samtal.
                          Chatten kommer att baseras på transkriptionen och
                          analysen.
                        </div>
                      )}

                      {isSendingChat && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] min-w-[50px] h-10 p-4 rounded-lg bg-[#2a2a2a] animate-pulse" />
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Recommended questions (stays fixed at bottom) */}
                  {recommendedQuestions.length > 0 && (
                    <div className="px-6 py-3 border-t border-[#333] bg-[#1a1a1a]">
                      <p className="text-sm text-gray-400 mb-2">
                        Föreslagna frågor:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recommendedQuestions.map((question) => (
                          <button
                            key={question.id}
                            onClick={() =>
                              handleRecommendedQuestionClick(question.text)
                            }
                            className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-sm text-gray-300 rounded-full"
                          >
                            {question.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input form (stays fixed at bottom) */}
                  <form
                    onSubmit={handleChatSubmit}
                    className="px-6 py-4 border-t border-[#333] bg-[#1a1a1a]"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <Textarea
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onClick={() => setIsTextareaExpanded(true)}
                          onBlur={() =>
                            chatMessage.length === 0 &&
                            setIsTextareaExpanded(false)
                          }
                          placeholder="Fråga din AI-coach om detta samtal..."
                          className={`w-full p-3 bg-[#2a2a2a] border border-[#333] rounded-lg text-white resize-none transition-all ${
                            isTextareaExpanded
                              ? "min-h-[120px]"
                              : "min-h-[50px]"
                          }`}
                          disabled={isSendingChat}
                        />
                        <Button
                          type="submit"
                          disabled={!chatMessage.trim() || isSendingChat}
                          className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-[#333] disabled:text-gray-500"
                          size="icon"
                        >
                          <FiSend className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Tryck Enter för att skicka, Shift+Enter för ny rad
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
   
      </div>
    </div>
  );
}
