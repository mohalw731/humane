"use client"

import { useAudioTranscriber } from "@/context/AudioTranscriberProvider"
import {
  Trash2,
  MessageSquare,
  FileText,
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Wand2,
  ArrowUp,
  SettingsIcon,
  ChevronDown,
  Zap,
  Menu,
  X,
  Upload,
} from "lucide-react"
import Markdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import Settings from "@/components/layout/Settings"
import useUserData from "@/hooks/useUser"
import Image from "next/image"
import Link from "next/link"
import DeleteCallModal from "@/components/layout/DeleteCallModal"
import UploadCallModal from "@/components/layout/UploadCallModal"

export default function TranscriptionPage(props: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(props.params)
  const { user } = useUserData()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [recommendedQuestionText, setRecommendedQuestionText] = useState("")
  const [hasCalledUseRecommendedQuestion, setHasCalledUseRecommendedQuestion] = useState(false)

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
    setShowUploadModal,
    setShowSettings,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    showUploadModal
  } = useAudioTranscriber()

  useEffect(() => {
    if (recommendedQuestionText && !hasCalledUseRecommendedQuestion) {
      useRecommendedQuestion(recommendedQuestionText)
      setRecommendedQuestionText("")
      setHasCalledUseRecommendedQuestion(true)
    }
  }, [recommendedQuestionText, useRecommendedQuestion])

  // Load the transcription when the page mounts or ID changes
  useEffect(() => {
    if (id) {
      const item = history.find((item) => item.id === id)
      if (item) {
        setSelectedHistoryItem(item)
      }
    }
  }, [id, history, setSelectedHistoryItem, router])

  const handleDeleteCall = () => {
    if (selectedHistoryItem) {
      setShowDeleteConfirmation(true)
      deleteTranscription(selectedHistoryItem.id)
    }
    setIsProfileDropdownOpen(false)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
    setIsProfileDropdownOpen(false)
  }

  const handleRecommendedQuestionClick = (questionText: string) => {
    setRecommendedQuestionText(questionText)
  }

  const navigationItems = [
    {
      id: "analysis",
      title: "Feedback",
      icon: BarChart3,
    },
    {
      id: "chat",
      title: "Fråga Quickfeed AI",
      icon: Wand2,
    },
    {
      id: "transcription",
      title: "Transkription",
      icon: FileText,
    },
  ]



  if (!selectedHistoryItem || selectedHistoryItem.id !== id) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="bg-[#121212] text-white h-screen flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-[#1E1F21] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col h-screen`}
      >
        {/* Sidebar Header - Fixed height */}
        <div className="flex-shrink-0 px-4 border-b border-[#1E1F21]">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-1">
              <Image
                src="/logo.png"
                alt="QuickFeed Logo"
                width={30}
                height={30}
                className="relative bottom-2"
              />
              <div className="flex flex-col">
                <span className=" text-xl text-white">uickFeed</span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-[#1e293b] text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation - Takes remaining space but allows profile to be visible */}
        <div className="flex-1 min-h-0 px-4 py-6">
          <nav className="space-y-3">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any)
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-black font-medium"
                    : "text-slate-400 hover:bg-[#1e293b] hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </button>
            ))}
            <button onClick={() => setShowUploadModal(true)} className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-colors text-slate-400 hover:bg-[#1e293b] hover:text-white gap-2">
              <Upload className="w-4 h-4" />
              Ladda upp smatal
              </button>
          </nav>
        </div>

        {/* Profile Section - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-[#1E1F21] relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[#1e293b] transition-colors"
          >

            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white truncate">{user?.name || "User"}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email || "user@example.com"}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1f1f1f] border border-[#1E1F21] rounded-lg shadow-lg py-1">
              <button
                onClick={handleDeleteCall}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-500 hover:bg-[#1e293b] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete this call</span>
              </button>
              <div className="h-px bg-[#1E1F21] my-1" />
              <button
                onClick={handleOpenSettings}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-[#1e293b] transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header - Fixed height */}
        <header className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-[#1E1F21] bg-[#121212]">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-[#1e293b] text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-[#1E1F21] hidden md:block" />
          <h1 className=" text-white truncate text-xl">
            {selectedHistoryItem.aiGeneratedTitle || selectedHistoryItem.audioName}
          </h1>
        </header>

        {/* Content - Scrollable */}
        <section className="flex-1 text-slate-100 bg-[#121212] overflow-auto">
          <div className="p-5 w-full">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
              <div className="space-y-4">
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
                  <Badge variant="outline" className="border-slate-700 text-slate-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(selectedHistoryItem.timestamp)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content sections */}
            <div className="space-y-6">
              {/* Transcription content */}
              <div className={`${activeTab === "transcription" ? "block" : "hidden"}`}>
                <div className="space-y-4 overflow-hidden  hover:overflow-auto">
                  {selectedHistoryItem.transcription.map((segment, index) => (
                    <div
                      key={index}
                      className="group p-4 rounded-xl bg-[#141414] border border-[#1E1F21] hover:bg-[#1E1F21] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
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
              </div>

              {/* Analysis content */}
              <div className={`${activeTab === "analysis" ? "block" : "hidden"} space-y-6`}>
                {selectedHistoryItem.analysis ? (
                  <div className="flex flex-col gap-6 w-full mb-10">
                    {/* Overview Score Section */}
                    <div className="bg-[#141414] border border-[#1E1F21] w-full rounded-xl md:p-6 p-4">
                      <header className="mb-4">
                        <h2 className="text-white flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Övergripande bedömning
                        </h2>
                      </header>
                      <div className="space-y-4">
                        <div className="flex items-center gap-6">
                          <div className="text-5xl font-bold text-primary">{selectedHistoryItem.analysis.score}/10</div>
                          <div className="flex-1 space-y-2">
                            <Progress value={(selectedHistoryItem.analysis.score / 10) * 100} className="h-3" />
                            <p className="text-sm text-slate-400">Prestandapoäng</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <p className="text-gray-500 text-sm leading-relaxed">
                            {selectedHistoryItem.analysis.scoreExplanation}
                          </p>

                          <div className="flex flex-col gap-2">
                            <span className="font-bold text-primary">Playbook Sammanfattning - </span>
                            <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                              {selectedHistoryItem.analysis.frameworkEvaluation}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="font-bold text-primary">Sammanfattning - </span>
                            <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                              {selectedHistoryItem.analysis.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses - Equal Height Columns */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                      {/* Strengths Column */}
                      {selectedHistoryItem.analysis.strengths.length > 0 && (
                        <div className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px] flex flex-col">
                          <header className="flex-shrink-0 p-4 border-b border-[#1E1F21]">
                            <h2 className="text-white flex items-center">
                              <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                              Styrkor
                            </h2>
                          </header>
                          <div className="flex-1 p-4 overflow-hidden hover:overflow-auto">
                            <div className="flex flex-col gap-4">
                              {selectedHistoryItem.analysis.strengths.map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[#141414] border border-[#1E1F21]">
                                  <h4 className="font-medium text-emerald-300 mb-2">{item.title}</h4>
                                  <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                                    {item.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Weaknesses Column */}
                      {selectedHistoryItem.analysis.weaknesses.length > 0 && (
                        <div className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px] flex flex-col">
                          <header className="flex-shrink-0 p-4 border-b border-[#1E1F21]">
                            <h2 className="text-white flex items-center">
                              <Target className="w-5 h-5 mr-2 text-amber-400" />
                              Förbättringsförslag
                            </h2>
                          </header>
                          <div className="flex-1 p-4 overflow-hidden hover:overflow-auto">
                            <div className="flex flex-col gap-4">
                              {selectedHistoryItem.analysis.weaknesses.map((item, i) => (
                                <div key={i} className="p-4 rounded-lg bg-[#141414] border border-[#1E1F21]">
                                  <h4 className="font-medium text-amber-300 mb-2">{item.title}</h4>
                                  <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                                    {item.suggestion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Critical Moments & Recommendations - Equal Height Columns */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                      {/* Lost Moments Column */}
                      {selectedHistoryItem.analysis.lostMoments.length > 0 && (
                        <div className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px] flex flex-col">
                          <header className="flex-shrink-0 p-4 border-b border-[#1E1F21]">
                            <h2 className="text-white flex items-center">
                              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                              Kritiska ögonblick{" "}
                            </h2>
                          </header>
                          <div className="flex-1 p-4 overflow-hidden hover:overflow-auto">
                            <div className="flex flex-col gap-4">
                              {selectedHistoryItem.analysis.lostMoments.map((item, i) => (
                                <div key={i} className="p-4 rounded-lg bg-[#141414] border border-[#1E1F21]">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-red-300">{item.time}</h4>
                                  </div>
                                  <p className="text-slate-100 leading-relaxed md:text-base text-sm">
                                    {item.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommendations Column */}
                      {selectedHistoryItem.analysis.recommendations.length > 0 && (
                        <div className="bg-[#141414] border border-[#1E1F21] rounded-xl h-[500px] flex flex-col">
                          <header className="flex-shrink-0 p-4 border-b border-[#1E1F21]">
                            <h2 className="text-white flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />
                              Rekommendationer
                            </h2>
                          </header>
                          <div className="flex-1 p-4 overflow-hidden hover:overflow-auto">
                            <div className="flex flex-col gap-4">
                              {selectedHistoryItem.analysis.recommendations.map((item, i) => (
                                <div key={i} className="p-4 rounded-lg bg-[#141414] border border-[#1E1F21] ">
                                  <h4 className="font-medium text-blue-300 mb-2">{item?.action || ""}</h4>
                                  <p className="text-slate-100 leading-relaxed md:text-base text-sm">{item.benefit}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>
                ) : (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No analysis available for this conversation</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Chat content */}
              <div className={`${activeTab === "chat" ? "block" : "hidden"} space-y-4`}>
                {/* Recommended questions */}
                {recommendedQuestions.length > 0 && (
                  <div>
                    <div className=" flex-wrap gap-2 md:flex hidden">
                      {recommendedQuestions.map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleRecommendedQuestionClick(question.text)}
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
                        onBlur={() => chatMessage.length === 0 && setIsTextareaExpanded(false)}
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
                      AI kan göra misstag. Svaren baseras på feedbacken och transkriptionen .
                    </p>
                  </div>
                </form>

                <div className="overflow-hidden hover:overflow-auto mb-10 pr-2">
                  <div className="space-y-4 mb-10">
                    {selectedHistoryItem?.chatMessages?.length || 0 > 0 ? (
                      selectedHistoryItem?.chatMessages?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`md:max-w-[60%] p-2 px-4 rounded-xl ${
                              message.role === "user"
                                ? " text-white bg-[#18181b] border border-[#1E1F21] max-w-[80%]"
                                : "bg-primary text-black max-w-[100%] "
                            }`}
                          >
                            <Markdown>{message.content}</Markdown>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 mb-2">Starta en konversation med Quickfeed AI</p>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                          Ställ frågor om samtalet och få värdefulla insikter direkt. Men kom ihåg att AI ibland kan
                          göra misstag. Kontrollera alltid viktig information för att säkerställa noggrannhet.
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
                </div>
              </div>
            </div>
          </div>

          {showSettings && <Settings />}
                    {showDeleteConfirmation && <DeleteCallModal />}
                    {showUploadModal && <UploadCallModal />}
        </section>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && <div className="fixed inset-0 z-30" onClick={() => setIsProfileDropdownOpen(false)} />}
    </div>
  )
}
