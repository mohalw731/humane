"use client"

import { useAudioTranscriber } from "@/context/AudioTranscriberProvider"
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
} from "lucide-react"
import Markdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function TranscriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
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
  } = useAudioTranscriber()

  const handleRecommendedQuestionClick = (questionText: string) => {
    useRecommendedQuestion(questionText)
  }

  // Load the transcription when the page mounts or ID changes
  useEffect(() => {
    if (params.id) {
      const item = history.find((item) => item.id === params.id)
      if (item) {
        setSelectedHistoryItem(item)
      } else {
        // Redirect if not found
        router.push("/dashboard")
      }
    }
  }, [params.id, history, setSelectedHistoryItem, router])

  if (!selectedHistoryItem || selectedHistoryItem.id !== params.id) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-white leading-tight">
              {selectedHistoryItem.aiGeneratedTitle || selectedHistoryItem.audioName}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700">
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
              <Badge variant="outline" className="border-slate-700 text-slate-400">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(selectedHistoryItem.timestamp)}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => deleteTranscription(selectedHistoryItem.id)}
            disabled={isDeleting === selectedHistoryItem.id}
            variant="destructive"
            className="bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/30 self-start lg:self-center"
          >
            {isDeleting === selectedHistoryItem.id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800">
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Coach
            </TabsTrigger>
            <TabsTrigger
              value="transcription"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Transcription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcription" className="space-y-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Conversation Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4">
                    {selectedHistoryItem.transcription.map((segment, index) => (
                      <div
                        key={index}
                        className="group p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span className="font-medium">{segment.speaker}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>
                              {formatTime(segment.start)} - {formatTime(segment.end)}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-100 leading-relaxed">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {selectedHistoryItem.analysis ? (
              <div className="grid gap-6">
                {/* Score Section */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Overall Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl font-bold text-blue-400">{selectedHistoryItem.analysis.score}/10</div>
                      <div className="flex-1 space-y-2">
                        <Progress value={(selectedHistoryItem.analysis.score / 10) * 100} className="h-3" />
                        <p className="text-sm text-slate-400">Performance Score</p>
                      </div>
                    </div>
                    <p className="text-slate-100 leading-relaxed">{selectedHistoryItem.analysis.scoreExplanation}</p>
                  </CardContent>
                </Card>

                {/* Summary Section */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-100 leading-relaxed">{selectedHistoryItem.analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Strengths Section */}
                {selectedHistoryItem.analysis.strengths.length > 0 && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {selectedHistoryItem.analysis.strengths.map((item, i) => (
                          <div key={i} className="p-4 rounded-lg bg-emerald-900/10 border border-emerald-800/30">
                            <h4 className="font-medium text-emerald-300 mb-2">{item.title}</h4>
                            <p className="text-slate-100 leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Weaknesses Section */}
                {selectedHistoryItem.analysis.weaknesses.length > 0 && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Target className="w-5 h-5 mr-2 text-amber-400" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {selectedHistoryItem.analysis.weaknesses.map((item, i) => (
                          <div key={i} className="p-4 rounded-lg bg-amber-900/10 border border-amber-800/30">
                            <h4 className="font-medium text-amber-300 mb-2">{item.title}</h4>
                            <p className="text-slate-100 leading-relaxed">{item.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lost Moments Section */}
                {selectedHistoryItem.analysis.lostMoments.length > 0 && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                        Critical Moments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {selectedHistoryItem.analysis.lostMoments.map((item, i) => (
                          <div key={i} className="p-4 rounded-lg bg-red-900/10 border border-red-800/30">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-red-300">{item.time}</h4>
                            </div>
                            <p className="text-slate-100 leading-relaxed">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Framework Evaluation */}
                {selectedHistoryItem.analysis.frameworkEvaluation && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Framework Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-100 leading-relaxed">
                        {selectedHistoryItem.analysis.frameworkEvaluation}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {selectedHistoryItem.analysis.recommendations.length > 0 && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {selectedHistoryItem.analysis.recommendations.map((item, i) => (
                          <div key={i} className="p-4 rounded-lg bg-blue-900/10 border border-blue-800/30">
                            <h4 className="font-medium text-blue-300 mb-2">{item?.action || ""}</h4>
                            <p className="text-slate-100 leading-relaxed">{item.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No analysis available for this conversation</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  AI Coach Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Chat messages container */}
                <ScrollArea ref={chatContainerRef} className="h-[400px] p-6">
                  <div className="space-y-4">
                    {selectedHistoryItem?.chatMessages?.length || 0 > 0 ? (
                      selectedHistoryItem?.chatMessages?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-slate-100 border border-slate-700"
                            }`}
                          >
                            <Markdown >{message.content}</Markdown>
                            <p className="text-xs mt-2 opacity-70">{formatDate(message.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-2">Start a conversation with your AI coach</p>
                        <p className="text-sm text-slate-500">
                          Ask questions about this conversation based on the transcription and analysis.
                        </p>
                      </div>
                    )}

                    {isSendingChat && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-4 rounded-lg bg-slate-800 border border-slate-700">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Recommended questions */}
                {recommendedQuestions.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
                    <p className="text-sm text-slate-400 mb-3">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendedQuestions.map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleRecommendedQuestionClick(question.text)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 rounded-lg border border-slate-700 transition-colors"
                        >
                          {question.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input form */}
                <form onSubmit={handleChatSubmit} className="p-6 border-t border-slate-800">
                  <div className="space-y-2">
                    <div className="relative">
                      <Textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={() => setIsTextareaExpanded(true)}
                        onBlur={() => chatMessage.length === 0 && setIsTextareaExpanded(false)}
                        placeholder="Ask your AI coach about this conversation..."
                        className={`w-full p-4 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          isTextareaExpanded ? "min-h-[120px]" : "min-h-[60px]"
                        }`}
                        disabled={isSendingChat}
                      />
                      <Button
                        type="submit"
                        disabled={!chatMessage.trim() || isSendingChat}
                        className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500"
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">Press Enter to send, Shift+Enter for new line</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
