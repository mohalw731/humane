"use client";

import { useAudioTranscriber } from "@/context/AudioTranscriberProvider";
import {
  Trash2,
  Send,
  MessageSquare,
  FileText,
  BarChart3,
  Clock,
  User,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Wand2,
  ArrowUp,
} from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/navbar/Navbar";
import Settings from "@/components/layout/Settings";

export default function TranscriptionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(props.params);

  const {
    history,
    selectedHistoryItem,
    activeTab,
    isDeleting,
    chatMessage,
    isSendingChat,
    chatContainerRef,
    recommendedQuestions,
    isTextareaExpanded,
    setActiveTab,
    setChatMessage,
    setIsTextareaExpanded,
    deleteTranscription,
    handleChatSubmit,
    useRecommendedQuestion,
    handleKeyDown,
    formatTime,
    formatDate,
    getFrameworkName,
    getCallTypeName,
    setSelectedHistoryItem,
    showSettings,
  } = useAudioTranscriber();

  const handleRecommendedQuestionClick = (questionText: string) => {
    useRecommendedQuestion(questionText);
  };

  // Load the transcription when the page mounts or ID changes
  useEffect(() => {
    if (id) {
      const item = history.find((item) => item.id === id);
      if (item) {
        setSelectedHistoryItem(item);
      }
    }
  }, [id, history, setSelectedHistoryItem, router]);

  if (!selectedHistoryItem || selectedHistoryItem.id !== id) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100">
      <Navbar />
      <div className="">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
          <div className="space-y-4">
            <h1 className="md:text-3xl text-xl text-white leading-tight">
              {selectedHistoryItem.aiGeneratedTitle ||
                selectedHistoryItem.audioName}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              >
                {selectedHistoryItem.language === "sv" ? "Svenska" : "English"}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-emerald-900/30 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50"
              >
                {getCallTypeName(selectedHistoryItem.callType)}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-violet-900/30 text-violet-300 border-violet-800 hover:bg-violet-900/50"
              >
                {getFrameworkName(selectedHistoryItem.framework)}
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-700 text-slate-400"
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(selectedHistoryItem.timestamp)}
              </Badge>
            </div>
          </div>
          
        </div>

        {/* Tab buttons */}
        <div className="flex gap-4 md:mb-10 mb-5 flex-wrap">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center py-1 md:px-4 text-sm rounded ${
              activeTab === "analysis"
                ? "bg-primary text-black px-4 "
                : "text-slate-400 hover:bg-[#1e293b] hover:px-4 transition-all"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Feedback
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center py-1 md:px-4 text-sm rounded ${
              activeTab === "chat"
                ? "bg-primary text-black px-4 "
                : "text-slate-400 hover:bg-[#1e293b] hover:px-4 transition-all"
            }`}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Fråga Quickfeed AI
          </button>
          <button
            onClick={() => setActiveTab("transcription")}
            className={`flex items-center py-1 md:px-4 text-sm rounded ${
              activeTab === "transcription"
                ? "bg-primary text-black px-4"
                : "text-slate-400 hover:bg-[#1e293b] hover:px-4 transition-all"
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Transkription
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Transcription content */}
          <div
            className={`${activeTab === "transcription" ? "block" : "hidden"}`}
          >
            <ScrollArea className="h-[calc(100vh-300px)] pr-3">
              <div className="space-y-4">
                {selectedHistoryItem.transcription.map((segment, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-xl bg-[#141414] border border-[#1E1F21] hover:bg-[#1E1F21] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          {formatTime(segment.start)} -{" "}
                          {formatTime(segment.end)}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-100 leading-relaxed">
                      {segment.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Analysis content */}
          <div
            className={`${
              activeTab === "analysis" ? "block" : "hidden"
            } space-y-6`}
          >
            {selectedHistoryItem.analysis ? (
              <div className="flex flex-col gap-6 w-full mb-10">
                {/* Overview Score Section */}
                <ScrollArea className="bg-[#141414] border border-[#1E1F21] w-full rounded-xl md:p-6 p-4">
                  <header className="mb-4">
                    <h2 className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Övergripande bedömning
                    </h2>
                  </header>
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl font-bold text-primary">
                        {selectedHistoryItem.analysis.score}/10
                      </div>
                      <div className="flex-1 space-y-2">
                        <Progress
                          value={
                            (selectedHistoryItem.analysis.score / 10) * 100
                          }
                          className="h-3"
                        />
                        <p className="text-sm text-slate-400">Prestandapoäng</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {selectedHistoryItem.analysis.scoreExplanation}
                      </p>

                      <div className="flex flex-col gap-2">
                        <span className="font-bold text-primary">
                          Playbook Sammanfattning -{" "}
                        </span>
                        <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                          {selectedHistoryItem.analysis.frameworkEvaluation}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="font-bold text-primary">
                          Sammanfattning -{" "}
                        </span>
                        <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                          {selectedHistoryItem.analysis.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Strengths & Weaknesses - Equal Height Columns */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  {/* Strengths Column */}
                  {selectedHistoryItem.analysis.strengths.length > 0 && (
                    <ScrollArea className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px]">
                      <header className="sticky top-0 bg-[#141414] p-4  z-10">
                        <h2 className="text-white flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                          Styrkor
                        </h2>
                      </header>
                      <div className="p-4">
                        <div className="flex flex-col gap-4">
                          {selectedHistoryItem.analysis.strengths.map(
                            (item, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-800/30"
                              >
                                <h4 className="font-medium text-emerald-300 mb-2">
                                  {item.title}
                                </h4>
                                <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                                  {item.description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  )}

                  {/* Weaknesses Column */}
                  {selectedHistoryItem.analysis.weaknesses.length > 0 && (
                    <ScrollArea className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px]">
                      <header className="sticky top-0 bg-[#141414] p-4  z-10">
                        <h2 className="text-white flex items-center">
                          <Target className="w-5 h-5 mr-2 text-amber-400" />
                          Förbättringsförslag
                        </h2>
                      </header>
                      <div className="p-4">
                        <div className="flex flex-col gap-4">
                          {selectedHistoryItem.analysis.weaknesses.map(
                            (item, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-lg bg-amber-900/10 border border-amber-800/30"
                              >
                                <h4 className="font-medium text-amber-300 mb-2">
                                  {item.title}
                                </h4>
                                <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                                  {item.suggestion}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </section>

                {/* Critical Moments & Recommendations - Equal Height Columns */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  {/* Lost Moments Column */}
                  {selectedHistoryItem.analysis.lostMoments.length > 0 && (
                    <ScrollArea className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px]">
                      <header className="sticky top-0 bg-[#141414] p-4  z-10">
                        <h2 className="text-white flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                          Kritiska ögonblick{" "}
                        </h2>
                      </header>
                      <div className="p-4">
                        <div className="flex flex-col gap-4">
                          {selectedHistoryItem.analysis.lostMoments.map(
                            (item, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-lg bg-red-900/10 border border-red-800/30"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-red-300">
                                    {item.time}
                                  </h4>
                                </div>
                                <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                                  {item.description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  )}

                  {/* Recommendations Column */}
                  {selectedHistoryItem.analysis.recommendations.length > 0 && (
                    <ScrollArea className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px]">
                      <header className="sticky top-0 bg-[#141414] p-4  z-10">
                        <h2 className="text-white flex items-center">
                          <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />
                          Rekommendationer
                        </h2>
                      </header>
                      <div className="p-4">
                        <div className="flex flex-col gap-4">
                          {selectedHistoryItem.analysis.recommendations.map(
                            (item, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-lg bg-blue-900/10 border border-blue-800/30"
                              >
                                <h4 className="font-medium text-blue-300 mb-2">
                                  {item?.action || ""}
                                </h4>
                                <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                                  {item.benefit}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </section>
              </div>
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    No analysis available for this conversation
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat content */}
          <div
            className={`${activeTab === "chat" ? "block" : "hidden"} space-y-4`}
          >
            {/* Chat messages container */}

            {/* Recommended questions */}
            {recommendedQuestions.length > 0 && (
              <div>
                <div className=" flex-wrap gap-2 md:flex hidden">
                  {recommendedQuestions.map((question) => (
                    <button
                      key={question.id}
                      onClick={() =>
                        handleRecommendedQuestionClick(question.text)
                      }
                      className="px-3 py-1 bg-[#1f1f1f] hover:bg-slate-700 text-sm text-slate-300 rounded-lg border border-[#1E1F21] transition-colors"
                    >
                      {question.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleChatSubmit} className=" mt-4">
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={() => setIsTextareaExpanded(true)}
                    onBlur={() =>
                      chatMessage.length === 0 && setIsTextareaExpanded(false)
                    }
                    placeholder="Fråga Quickfeed AI "
                    className={`w-full p-4 bg-[#141414] border border-[#1E1F21] rounded-lg text-white resize-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm ${
                      isTextareaExpanded ? "min-h-[120px]" : "min-h-[60px]"
                    }`}
                    disabled={isSendingChat}
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim() || isSendingChat}
                    className="absolute right-3 bottom-3 disabled:opacity-50"
                  >
                    <ArrowUp className="size-6 text-primary" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  AI kan göra misstag. Svaren baseras på feedbacken och
                  transkriptionen .
                </p>
              </div>
            </form>
            <ScrollArea
              ref={chatContainerRef}
              className="overflow-y-auto  md:max-h-full max-h-[450px] mb-10 pr-2"
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
                        className={`md:max-w-[80%] p-2 px-4 rounded-xl ${
                          message.role === "user"
                            ? " text-white bg-[#18181b] border border-[#1E1F21] max-w-[80%]"
                            : "bg-primary text-black md:max-w-[70%] max-w-[100%] "
                        }`}
                      >
                        <Markdown>{message.content}</Markdown>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">
                      Starta en konversation med Quickfeed AI
                    </p>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                     Ställ frågor om samtalet och få värdefulla insikter direkt. Men kom ihåg att AI ibland kan göra misstag. Kontrollera alltid viktig information för att säkerställa noggrannhet.
                    </p>
                  </div>
                )}

                {isSendingChat && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-xl bg-primary ">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-black rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-black rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {showSettings && <Settings />}
    </div>
  );
}
