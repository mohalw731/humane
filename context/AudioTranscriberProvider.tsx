"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import useUserData from "@/hooks/useUser";

// Types
export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  speaker: string;
}

export interface AnalysisItem {
  title: string;
  description: string;
  action?: string;
  suggestion?: string;
  benefit?: string;
  time?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface TranscriptionHistoryItem {
  id: string;
  timestamp: Date;
  language: string;
  audioName: string;
  transcription: TranscriptionSegment[];
  rawText: string;
  userId?: string;
  aiGeneratedTitle?: string;
  callType: string;
  framework: string;
  analysis?: {
    score: number;
    scoreExplanation: string;
    strengths: AnalysisItem[];
    weaknesses: AnalysisItem[];
    lostMoments: AnalysisItem[];
    summary: string;
    recommendations: AnalysisItem[];
    frameworkEvaluation: string;
  };
  chatMessages?: ChatMessage[];
}

export interface Settings {
  language: "en" | "sv";
  callType: string;
  framework: "BANT" | "SPIN" | "SNAP" | "MEDDICC" | "CUSTOM";
  customFramework?: string;
  useCustomPrompt: boolean;
  customPrompt?: string;
}

export interface RecommendedQuestion {
  id: string;
  text: string;
}

interface AudioTranscriberContextType {
  // State
  audioFile: File | null;
  isUploading: boolean;
  history: TranscriptionHistoryItem[];
  selectedHistoryItem: TranscriptionHistoryItem | null;
  activeTab: "transcription" | "analysis" | "chat";
  showSettings: boolean;
  settings: Settings;
  isDeleting: string | null;
  chatMessage: string;
  isSendingChat: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  showUploadModal: boolean;
  isDragging: boolean;
  showDeleteConfirmation: boolean;
  itemToDelete: string | null;
  recommendedQuestions: RecommendedQuestion[];
  isTextareaExpanded: boolean;

  // Actions
  setAudioFile: (file: File | null) => void;
  setActiveTab: (tab: "transcription" | "analysis" | "chat") => void;
  setShowSettings: (show: boolean) => void;
  setSelectedHistoryItem: (item: TranscriptionHistoryItem | null) => void;
  setChatMessage: (message: string) => void;
  setShowUploadModal: (show: boolean) => void;
  setIsDragging: (isDragging: boolean) => void;
  setShowDeleteConfirmation: (show: boolean) => void;
  setItemToDelete: (id: string | null) => void;
  setIsTextareaExpanded: (expanded: boolean) => void;

  // Functions
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  transcribeAudio: () => Promise<void>;
  deleteTranscription: (id: string) => Promise<void>;
  confirmDeleteTranscription: () => Promise<void>;
  handleSettingsChange: (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => void;
  openHistoryModal: (item: TranscriptionHistoryItem) => void;
  closeModal: () => void;
  handleChatSubmit: (e: React.FormEvent) => Promise<void>;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  useRecommendedQuestion: (question: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  updateTitle: (id: string, newTitle: string) => Promise<void>;

  // Utility functions
  formatTime: (seconds: number) => string;
  formatDate: (date: Date) => string;
  getFrameworkName: (framework: string) => string;
  getCallTypeName: (callType: string) => string;
}

// Create the context
const AudioTranscriberContext = createContext<
  AudioTranscriberContextType | undefined
>(undefined);

// Provider component
export function AudioTranscriberProvider({
  children,
  apiKey,
}: {
  children: ReactNode;
  apiKey: string;
}) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<TranscriptionHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<TranscriptionHistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<
    "transcription" | "analysis" | "chat"
  >("analysis");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    language: "sv",
    callType: "Discovery",
    framework: "BANT",
    useCustomPrompt: false,
    customPrompt: "",
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [recommendedQuestions, setRecommendedQuestions] = useState<
    RecommendedQuestion[]
  >([]);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);
  const { user } = useUserData();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = user?.uid || null;

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;

      try {
        const docRef = doc(db, "userSettings", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Settings;
          setSettings({
            language: data.language || "sv",
            callType: data.callType || "Discovery",
            framework: data.framework || "BANT",
            customFramework: data.customFramework || "",
            useCustomPrompt: data.useCustomPrompt || false,
            customPrompt: data.customPrompt || "",
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [userId]);

  // Load transcription history from Firebase
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "transcriptions"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: TranscriptionHistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
          items.push({
            id: doc.id,
            timestamp: data.timestamp.toDate(),
            language: data.language,
            audioName: data.audioName,
            transcription: data.transcription,
            rawText: data.rawText,
            userId: data.userId,
            aiGeneratedTitle: data.aiGeneratedTitle || null,
            callType: data.callType || "Discovery",
            framework: data.framework || "BANT",
            analysis: data.analysis,
            chatMessages:
              data.chatMessages?.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp?.toDate() || new Date(),
              })) || [],
          });
        }
      });
      setHistory(items);
    });

    return () => unsubscribe();
  }, [userId]);

  // Generate recommended questions when a history item is selected
  useEffect(() => {
    if (selectedHistoryItem && activeTab === "chat") {
      generateRecommendedQuestions();
    }
  }, [selectedHistoryItem, activeTab]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current && activeTab === "chat") {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [selectedHistoryItem?.chatMessages, activeTab]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        setShowSettings(false);
        setShowUploadModal(false);
        setShowDeleteConfirmation(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Generate recommended questions based on the call analysis
  const generateRecommendedQuestions = async () => {
    if (!selectedHistoryItem || !selectedHistoryItem.analysis) return;

    try {
      const questions = [
        {
          id: "1",
          text:
            settings.language === "sv"
              ? "Hur kan jag förbättra min öppning av samtalet?"
              : "How can I improve my call opening?",
        },
        {
          id: "2",
          text:
            settings.language === "sv"
              ? "Vilka frågor borde jag ha ställt?"
              : "What questions should I have asked?",
        },
       
        {
          id: "3",
          text:
            settings.language === "sv"
              ? "Ge mig exempel på bättre formuleringar"
              : "Give me examples of better phrasing",
        },
      ];

      setRecommendedQuestions(questions);
    } catch (error) {
      console.error("Error generating recommended questions:", error);
    }
  };

  // Save settings to Firebase when they change
  const saveSettingsToFirebase = async (newSettings: Settings) => {
    if (!userId) return;

    try {
      const docRef = doc(db, "userSettings", userId);
      await setDoc(docRef, newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleSettingsChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const newSettings = {
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    };

    setSettings(newSettings);
    saveSettingsToFirebase(newSettings);
  };

  const deleteTranscription = async (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteTranscription = async () => {
    if (!itemToDelete || !userId) return;

    setIsDeleting(itemToDelete);
    try {
      await deleteDoc(doc(db, "transcriptions", itemToDelete));
      // If the deleted item is currently selected, close the modal
      if (selectedHistoryItem?.id === itemToDelete) {
        setSelectedHistoryItem(null);
      }
    } catch (error) {
      console.error("Error deleting transcription:", error);
      alert(
        settings.language === "sv"
          ? "Kunde inte radera transkriptionen"
          : "Could not delete transcription"
      );
    } finally {
      setIsDeleting(null);
      setShowDeleteConfirmation(false);
      setItemToDelete(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      alert(
        settings.language === "sv"
          ? "Vänligen välj en ljudfil"
          : "Please select an audio file"
      );
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setAudioFile(file);
      } else {
        alert(
          settings.language === "sv"
            ? "Vänligen välj en ljudfil"
            : "Please select an audio file"
        );
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(
      settings.language === "sv" ? "sv-SE" : "en-US",
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  };

  const getFrameworkName = (framework: string) => {
    switch (framework) {
      case "BANT":
        return settings.language === "sv" ? "BANT" : "BANT";
      case "SPIN":
        return settings.language === "sv" ? "SPIN" : "SPIN";
      case "SNAP":
        return settings.language === "sv" ? "SNAP" : "SNAP";
      case "MEDDICC":
        return settings.language === "sv" ? "MEDDICC" : "MEDDICC";
      case "CUSTOM":
        return settings.language === "sv" ? "Anpassad" : "Custom";
      default:
        return framework;
    }
  };

  const getCallTypeName = (callType: string) => {
    switch (callType) {
      case "Discovery":
        return settings.language === "sv" ? "Upptäckt" : "Discovery";
      case "Demo":
        return settings.language === "sv" ? "Demo" : "Demo";
      case "Closing":
        return settings.language === "sv" ? "Avslut" : "Closing";
      case "Follow-up":
        return settings.language === "sv" ? "Uppföljning" : "Follow-up";
      case "Negotiation":
        return settings.language === "sv" ? "Förhandling" : "Negotiation";
      default:
        return callType;
    }
  };

  const saveToFirebase = async (
    transcriptionData: Omit<TranscriptionHistoryItem, "id">
  ) => {
    try {
      const docRef = await addDoc(collection(db, "transcriptions"), {
        ...transcriptionData,
        userId: userId || null,
        timestamp: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      throw error;
    }
  };

  const analyzeCall = async (transcriptionText: string) => {
    try {
      let prompt = "";

      if (settings.useCustomPrompt && settings.customPrompt) {
        prompt = settings.customPrompt.replace(
          "{transcription}",
          transcriptionText.substring(0, 12000)
        );
      } else {
        const frameworkInstructions = {
          BANT: {
            en: "Analyze using Budget, Authority, Need, and Timing framework. ",
            sv: "Analysera med Budget, Myndighet, Behov och Tidsram (BANT). ",
          },
          SPIN: {
            en: "Analyze using Situation, Problem, Implication, Need-payoff framework. ",
            sv: "Analysera med Situation, Problem, Konsekvens, Lösningsbehov (SPIN). ",
          },
          SNAP: {
            en: "Analyze focusing on Simple, iNvaluable, Align, Prioritize. ",
            sv: "Analysera med fokus på Enkelt, Ovärderligt, Anpassa, Prioritera (SNAP). ",
          },
          MEDDICC: {
            en: "Analyze using Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, Competition. ",
            sv: "Analysera med Mått, Ekonomisk beslutsfattare, Beslutskriterier, Beslutsprocess, Identifiera problem, Förespråkare, Konkurrens (MEDDICC). ",
          },
          CUSTOM: {
            en: settings.customFramework
              ? `Analyze using ${settings.customFramework}. `
              : "",
            sv: settings.customFramework
              ? `Analysera med ${settings.customFramework}. `
              : "",
          },
        };

        const languagePrompts = {
          en: `You are an expert sales coach analyzing a ${settings.callType.toLowerCase()} call. ${
            frameworkInstructions[settings.framework].en
          }
            Provide comprehensive feedback including:
            1. Score (1-10) with detailed justification
            2. 5-7 key strengths with specific examples
            3. 5-7 improvement areas with concrete suggestions
            4. 3-5 critical moments where the seller lost momentum
            5. Detailed summary with key conversation points
            6. Actionable recommendations for next steps
            7. Framework-specific evaluation
            
            Return ONLY a valid JSON object with these keys:
            - "score" (number)
            - "scoreExplanation" (string)
            - "strengths" (array of objects with "title" and "description")
            - "weaknesses" (array of objects with "title" and "suggestion")
            - "lostMoments" (array of objects with "time" and "description")
            - "summary" (string)
            - "recommendations" (array of objects with "action" and "benefit")
            - "frameworkEvaluation" (string)`,

          sv: `Du är en expert på försäljning som analyserar ett ${settings.callType.toLowerCase()}samtal. ${
            frameworkInstructions[settings.framework].sv
          }
            Ge utförlig feedback inklusive:
            1. Betyg (1-10) med detaljerad motivering
            2. 5-7 styrkor med specifika exempel
            3. 5-7 förbättringsområden med konkreta förslag
            4. 3-5 kritiska ögonblick då säljaren tappade momentum
            5. Detaljerad sammanfattning med viktiga punkter
            6. Handlingsbara rekommendationer för nästa steg
            7. Ramverksspecifik utvärdering
            
            Returnera ENDAST ett giltigt JSON-objekt med dessa nycklar:
            - "score" (nummer)
            - "scoreExplanation" (sträng)
            - "strengths" (array av objekt med "title" och "description")
            - "weaknesses" (array av objekt med "title" och "suggestion")
            - "lostMoments" (array av objekt med "time" och "description")
            - "summary" (sträng)
            - "recommendations" (array av objekt med "action" och "benefit")
            - "frameworkEvaluation" (sträng)`,
        };

        prompt = languagePrompts[settings.language];
        prompt += `\n\nCall transcription: ${transcriptionText.substring(
          0,
          12000
        )}`;
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4-1106-preview",
            messages: [
              {
                role: "system",
                content:
                  settings.language === "sv"
                    ? "Du är en erfaren säljcoach. Ge detaljerad, strukturerad feedback på svenska."
                    : "You are an experienced sales coach. Provide detailed, structured feedback in English.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
            max_tokens: 3000,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error details:", errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      const cleanedContent = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        const result = JSON.parse(cleanedContent);

        const defaultResponse = {
          score: 0,
          scoreExplanation: "",
          strengths: [],
          weaknesses: [],
          lostMoments: [],
          summary: "",
          recommendations: [],
          frameworkEvaluation: "",
        };

        return { ...defaultResponse, ...result };
      } catch (e) {
        console.error("Failed to parse AI response. Raw content:", content);
        throw new Error("Received invalid analysis format");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  };

  const transcribeAudio = async () => {
    if (!audioFile) {
      alert(
        settings.language === "sv"
          ? "Vänligen välj en ljudfil först"
          : "Please select an audio file first"
      );
      return;
    }

    setIsUploading(true);
    setShowUploadModal(false);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "whisper-1");
      formData.append("language", settings.language);
      formData.append("response_format", "verbose_json");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      let formattedTranscription: TranscriptionSegment[] = [];
      let fullText = "";

      if (data.segments) {
        formattedTranscription = data.segments.map((segment: any) => ({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          speaker: segment.speaker || "Speaker 1",
        }));
        fullText = data.segments.map((s: any) => s.text).join(" ");
      } else {
        formattedTranscription = [
          {
            text: data.text,
            start: 0,
            end: 0,
            speaker: "Speaker 1",
          },
        ];
        fullText = data.text;
      }

      let analysis = null;
      let aiGeneratedTitle = null;

      try {
        // First perform the full analysis
        analysis = await analyzeCall(fullText);

        // Then generate a descriptive title based on the call content
        const titleResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4-1106-preview",
              messages: [
                {
                  role: "system",
                  content:
                    settings.language === "sv"
                      ? 'Generera en kort titel som visar vem som ringde och vem som svarade ange bara namnen . Använd formatet "X → Y" där X är uppringaren och Y är mottagaren. Max 8 ord. '
                      : 'Generate a short title showing who called and who answered. Use format "X → Y" where X is caller and Y is recipient. Max 8 words. ONLY NAMES',
                },
                {
                  role: "user",
                  content:
                    settings.language === "sv"
                      ? `Sammanfattning av samtal: ${fullText.substring(
                          0,
                          2000
                        )}\n\nGenerera en lämplig titel:`
                      : `Call summary: ${fullText.substring(
                          0,
                          2000
                        )}\n\nGenerate an appropriate title:`,
                },
              ],
              temperature: 0.3,
              max_tokens: 20,
            }),
          }
        );

        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          aiGeneratedTitle = titleData.choices[0].message.content;
          // Clean up the title (remove quotes if present and trim whitespace)
          aiGeneratedTitle = aiGeneratedTitle.replace(/^"+|"+$/g, "").trim();
          // Ensure it's not too long
          if (aiGeneratedTitle.split(" ").length > 5) {
            aiGeneratedTitle =
              aiGeneratedTitle.split(" ").slice(0, 5).join(" ") + "...";
          }
        }
      } catch (analysisError) {
        console.error("Analysis or title generation failed:", analysisError);
        analysis = {
          score: 0,
          scoreExplanation:
            settings.language === "sv"
              ? "Analys misslyckades på grund av tekniskt fel"
              : "Analysis failed due to technical error",
          strengths: [],
          weaknesses: [
            {
              title:
                settings.language === "sv" ? "Analysfel" : "Analysis error",
              suggestion:
                settings.language === "sv"
                  ? "Kontrollera analysinställningarna och försök igen"
                  : "Check analysis settings and try again",
            },
          ],
          lostMoments: [],
          summary:
            settings.language === "sv"
              ? "Kunde inte analysera samtalet"
              : "Could not analyze the call",
          recommendations: [],
          frameworkEvaluation: "",
        };
      }

      const newItem = {
        timestamp: new Date(),
        language: settings.language,
        audioName: audioFile.name,
        transcription: formattedTranscription,
        rawText: fullText,
        userId: userId || null,
        analysis,
        aiGeneratedTitle,
        callType: settings.callType,
        framework: settings.framework,
        chatMessages: [],
      };

      await saveToFirebase(newItem as Omit<TranscriptionHistoryItem, "id">);

      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Transcription error:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const openHistoryModal = (item: TranscriptionHistoryItem) => {
    setSelectedHistoryItem(item);
    setActiveTab("analysis");
  };

  const closeModal = () => {
    setSelectedHistoryItem(null);
  };

  const useRecommendedQuestion = (question: string) => {
    setChatMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedHistoryItem || isSendingChat) return;

    setIsSendingChat(true);
    const userMessage = chatMessage;
    setChatMessage("");
    setIsTextareaExpanded(false);

    try {
      // Add user message to chat
      const userMessageId = Date.now().toString();
      const userMessageData: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      // Update local state immediately
      const updatedItem = {
        ...selectedHistoryItem,
        chatMessages: [
          ...(selectedHistoryItem.chatMessages || []),
          userMessageData,
        ],
      };
      setSelectedHistoryItem(updatedItem);

      // Save to Firebase
      await setDoc(
        doc(db, "transcriptions", selectedHistoryItem.id),
        {
          ...selectedHistoryItem,
          chatMessages: [
            ...(selectedHistoryItem.chatMessages || []),
            userMessageData,
          ],
        },
        { merge: true }
      );

      // Prepare context for the AI
      const context = `
        Transcription: ${selectedHistoryItem.rawText.substring(0, 8000)}
        Analysis Summary: ${
          selectedHistoryItem.analysis?.summary || "No analysis available"
        }
        Strengths: ${
          selectedHistoryItem.analysis?.strengths
            .map((s) => s.title + ": " + s.description)
            .join("\n") || "None"
        }
        Weaknesses: ${
          selectedHistoryItem.analysis?.weaknesses
            .map((w) => w.title + ": " + w.suggestion)
            .join("\n") || "None"
        }
        Recommendations: ${
          selectedHistoryItem.analysis?.recommendations
            .map((r) => r.action + ": " + r.benefit)
            .join("\n") || "None"
        }
      `;

      // Get AI response
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4-1106-preview",
            messages: [
              {
                role: "system",
                content:
                  selectedHistoryItem.language === "sv"
                    ? "Du är en säljcoach som hjälper användaren att förbättra sina försäljningsfärdigheter baserat på ett transkriberat samtal. Svara på svenska."
                    : "You are a sales coach helping the user improve their sales skills based on a transcribed call. Respond in English.",
              },
              {
                role: "system",
                content: `Here's the context for this call:\n${context}\n\nPrevious conversation:\n${(
                  selectedHistoryItem.chatMessages || []
                )
                  .slice(-5)
                  .map((m) => `${m.role}: ${m.content}`)
                  .join("\n")}`,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Add AI response to chat
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessageData: ChatMessage = {
        id: aiMessageId,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      // Update local state
      const finalUpdatedItem = {
        ...updatedItem,
        chatMessages: [...updatedItem.chatMessages, aiMessageData],
      };
      setSelectedHistoryItem(finalUpdatedItem);

      // Save to Firebase
      await setDoc(
        doc(db, "transcriptions", selectedHistoryItem.id),
        {
          ...selectedHistoryItem,
          chatMessages: [...updatedItem.chatMessages, aiMessageData],
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message to chat
      const errorMessageId = (Date.now() + 2).toString();
      const errorMessageData: ChatMessage = {
        id: errorMessageId,
        role: "assistant",
        content:
          settings.language === "sv"
            ? "Ett fel uppstod vid behandling av din förfrågan. Försök igen."
            : "An error occurred while processing your request. Please try again.",
        timestamp: new Date(),
      };

      const errorUpdatedItem = {
        ...selectedHistoryItem,
        chatMessages: [
          ...(selectedHistoryItem.chatMessages || []),
          errorMessageData,
        ],
      };
      setSelectedHistoryItem(errorUpdatedItem);

      await setDoc(
        doc(db, "transcriptions", selectedHistoryItem.id),
        {
          ...selectedHistoryItem,
          chatMessages: [
            ...(selectedHistoryItem.chatMessages || []),
            errorMessageData,
          ],
        },
        { merge: true }
      );
    } finally {
      setIsSendingChat(false);
    }
  };

  const updateTitle = async (id: string, newTitle: string) => {
  try {
    await setDoc(
      doc(db, "transcriptions", id),
      {
        aiGeneratedTitle: newTitle,
      },
      { merge: true }
    );
    
    // Update local state
    setHistory(history.map(item => 
      item.id === id ? {...item, aiGeneratedTitle: newTitle} : item
    ));
    
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem({
        ...selectedHistoryItem,
        aiGeneratedTitle: newTitle
      });
    }
  } catch (error) {
    console.error("Error updating title:", error);
    alert(
      settings.language === "sv"
        ? "Kunde inte uppdatera titeln"
        : "Could not update title"
    );
  }
};

  // Create the context value object
  const contextValue: AudioTranscriberContextType = {
    // State
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

    // State setters
    setAudioFile,
    setActiveTab,
    setShowSettings,
    setSelectedHistoryItem,
    setChatMessage,
    setShowUploadModal,
    setIsDragging,
    setShowDeleteConfirmation,
    setItemToDelete,
    setIsTextareaExpanded,

    // Functions
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
    updateTitle,

    // Utility functions
    formatTime,
    formatDate,
    getFrameworkName,
    getCallTypeName,
  };

  return (
    <AudioTranscriberContext.Provider value={contextValue}>
      {children}
    </AudioTranscriberContext.Provider>
  );
}

// Custom hook to use the context
export function useAudioTranscriber() {
  const context = useContext(AudioTranscriberContext);
  if (context === undefined) {
    throw new Error(
      "useAudioTranscriber must be used within an AudioTranscriberProvider"
    );
  }
  return context;
}
