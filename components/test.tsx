'use client';

import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiX, FiSettings, FiTrash2, FiSend } from 'react-icons/fi';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/configs/firebase';

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  speaker: string;
}

interface AnalysisItem {
  title: string;
  description: string;
  action?: string;
  suggestion?: string;
  benefit?: string;
  time?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TranscriptionHistoryItem {
  id: string;
  timestamp: Date;
  language: string;
  audioName: string;
  transcription: TranscriptionSegment[];
  rawText: string;
  userId?: string;
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

interface Settings {
  language: 'en' | 'sv';
  callType: string;
  framework: 'BANT' | 'SPIN' | 'SNAP' | 'MEDDICC' | 'CUSTOM';
  customFramework?: string;
  useCustomPrompt: boolean;
  customPrompt?: string;
}

export default function AudioTranscriber({ apiKey, userId }: { apiKey: string; userId?: string }) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<TranscriptionHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<TranscriptionHistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'transcription' | 'analysis' | 'chat'>('transcription');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    language: 'sv',
    callType: 'Discovery',
    framework: 'BANT',
    useCustomPrompt: false,
    customPrompt: ''
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;
      
      try {
        const docRef = doc(db, 'userSettings', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Settings;
          setSettings({
            language: data.language || 'sv',
            callType: data.callType || 'Discovery',
            framework: data.framework || 'BANT',
            customFramework: data.customFramework || '',
            useCustomPrompt: data.useCustomPrompt || false,
            customPrompt: data.customPrompt || ''
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [userId]);

  // Save settings to Firebase when they change
  const saveSettingsToFirebase = async (newSettings: Settings) => {
    if (!userId) return;
    
    try {
      const docRef = doc(db, 'userSettings', userId);
      await setDoc(docRef, newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const newSettings = {
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    };
    
    setSettings(newSettings);
    saveSettingsToFirebase(newSettings);
  };

  // Load transcription history
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'transcriptions'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: TranscriptionHistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only show transcriptions for the current user
        if (data.userId === userId) {
          items.push({
            id: doc.id,
            timestamp: data.timestamp.toDate(),
            language: data.language,
            audioName: data.audioName,
            transcription: data.transcription,
            rawText: data.rawText,
            userId: data.userId,
            analysis: data.analysis,
            chatMessages: data.chatMessages?.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp?.toDate() || new Date()
            })) || []
          });
        }
      });
      setHistory(items);
    });

    return () => unsubscribe();
  }, [userId]);

  const deleteTranscription = async (id: string) => {
    if (!userId) return;
    
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, 'transcriptions', id));
      // If the deleted item is currently selected, close the modal
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
      }
    } catch (error) {
      console.error('Error deleting transcription:', error);
      alert(settings.language === 'sv' ? 'Kunde inte radera transkriptionen' : 'Could not delete transcription');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      alert(settings.language === 'sv' ? 'Vänligen välj en ljudfil' : 'Please select an audio file');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(settings.language === 'sv' ? 'sv-SE' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const saveToFirebase = async (transcriptionData: Omit<TranscriptionHistoryItem, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'transcriptions'), {
        ...transcriptionData,
        userId: userId || null,
        timestamp: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      throw error;
    }
  };

  const analyzeCall = async (transcriptionText: string) => {
    try {
      let prompt = '';
      
      if (settings.useCustomPrompt && settings.customPrompt) {
        prompt = settings.customPrompt.replace('{transcription}', transcriptionText.substring(0, 12000));
      } else {
        const frameworkInstructions = {
          'BANT': {
            en: 'Analyze using Budget, Authority, Need, and Timing framework. ',
            sv: 'Analysera med Budget, Myndighet, Behov och Tidsram (BANT). '
          },
          'SPIN': {
            en: 'Analyze using Situation, Problem, Implication, Need-payoff framework. ',
            sv: 'Analysera med Situation, Problem, Konsekvens, Lösningsbehov (SPIN). '
          },
          'SNAP': {
            en: 'Analyze focusing on Simple, iNvaluable, Align, Prioritize. ',
            sv: 'Analysera med fokus på Enkelt, Ovärderligt, Anpassa, Prioritera (SNAP). '
          },
          'MEDDICC': {
            en: 'Analyze using Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion, Competition. ',
            sv: 'Analysera med Mått, Ekonomisk beslutsfattare, Beslutskriterier, Beslutsprocess, Identifiera problem, Förespråkare, Konkurrens (MEDDICC). '
          },
          'CUSTOM': {
            en: settings.customFramework ? `Analyze using ${settings.customFramework}. ` : '',
            sv: settings.customFramework ? `Analysera med ${settings.customFramework}. ` : ''
          }
        };

        const languagePrompts = {
          en: `You are an expert sales coach analyzing a ${settings.callType.toLowerCase()} call. ${frameworkInstructions[settings.framework].en}
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
            
          sv: `Du är en expert på försäljning som analyserar ett ${settings.callType.toLowerCase()}samtal. ${frameworkInstructions[settings.framework].sv}
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
            - "frameworkEvaluation" (sträng)`
        };

        prompt = languagePrompts[settings.language];
        prompt += `\n\nCall transcription: ${transcriptionText.substring(0, 12000)}`;
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-1106-preview',
          messages: [
            { 
              role: 'system', 
              content: settings.language === 'sv' ? 
                'Du är en erfaren säljcoach. Ge detaljerad, strukturerad feedback på svenska.' : 
                'You are an experienced sales coach. Provide detailed, structured feedback in English.' 
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error details:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const result = JSON.parse(cleanedContent);
        
        const defaultResponse = {
          score: 0,
          scoreExplanation: '',
          strengths: [],
          weaknesses: [],
          lostMoments: [],
          summary: '',
          recommendations: [],
          frameworkEvaluation: ''
        };
        
        return { ...defaultResponse, ...result };
      } catch (e) {
        console.error('Failed to parse AI response. Raw content:', content);
        throw new Error('Received invalid analysis format');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const transcribeAudio = async () => {
    if (!audioFile) {
      alert(settings.language === 'sv' ? 'Vänligen välj en ljudfil först' : 'Please select an audio file first');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('language', settings.language);
      formData.append('response_format', 'verbose_json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      let formattedTranscription: TranscriptionSegment[] = [];
      let fullText = '';

      if (data.segments) {
        formattedTranscription = data.segments.map((segment: any) => ({
          text: segment.text,
          start: segment.start,
          end: segment.end,
          speaker: segment.speaker || 'Speaker 1'
        }));
        fullText = data.segments.map((s: any) => s.text).join(' ');
      } else {
        formattedTranscription = [{ 
          text: data.text, 
          start: 0, 
          end: 0, 
          speaker: 'Speaker 1' 
        }];
        fullText = data.text;
      }

      let analysis = null;
      try {
        analysis = await analyzeCall(fullText);
      } catch (analysisError) {
        console.error('Analysis failed:', analysisError);
        analysis = {
          score: 0,
          scoreExplanation: settings.language === 'sv' ? 
            'Analys misslyckades på grund av tekniskt fel' : 
            'Analysis failed due to technical error',
          strengths: [],
          weaknesses: [{
            title: settings.language === 'sv' ? 'Analysfel' : 'Analysis error',
            suggestion: settings.language === 'sv' ? 
              'Kontrollera analysinställningarna och försök igen' : 
              'Check analysis settings and try again'
          }],
          lostMoments: [],
          summary: settings.language === 'sv' ? 
            'Kunde inte analysera samtalet' : 
            'Could not analyze the call',
          recommendations: [],
          frameworkEvaluation: ''
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
        chatMessages: []
      };

      await saveToFirebase(newItem as Omit<TranscriptionHistoryItem, 'id'>);

      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const openHistoryModal = (item: TranscriptionHistoryItem) => {
    setSelectedHistoryItem(item);
    setActiveTab('transcription');
  };

  const closeModal = () => {
    setSelectedHistoryItem(null);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedHistoryItem || isSendingChat) return;

    setIsSendingChat(true);
    const userMessage = chatMessage;
    setChatMessage('');

    try {
      // Add user message to chat
      const userMessageId = Date.now().toString();
      const userMessageData: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };

      // Update local state immediately
      const updatedItem = {
        ...selectedHistoryItem,
        chatMessages: [...(selectedHistoryItem.chatMessages || []), userMessageData]
      };
      setSelectedHistoryItem(updatedItem);

      // Save to Firebase
      await setDoc(doc(db, 'transcriptions', selectedHistoryItem.id), {
        ...selectedHistoryItem,
        chatMessages: [...(selectedHistoryItem.chatMessages || []), userMessageData]
      }, { merge: true });

      // Prepare context for the AI
      const context = `
        Transcription: ${selectedHistoryItem.rawText.substring(0, 8000)}
        Analysis Summary: ${selectedHistoryItem.analysis?.summary || 'No analysis available'}
        Strengths: ${selectedHistoryItem.analysis?.strengths.map(s => s.title + ': ' + s.description).join('\n') || 'None'}
        Weaknesses: ${selectedHistoryItem.analysis?.weaknesses.map(w => w.title + ': ' + w.suggestion).join('\n') || 'None'}
        Recommendations: ${selectedHistoryItem.analysis?.recommendations.map(r => r.action + ': ' + r.benefit).join('\n') || 'None'}
      `;

      // Get AI response
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-1106-preview',
          messages: [
            {
              role: 'system',
              content: settings.language === 'sv' ?
                'Du är en säljcoach som hjälper användaren att förbättra sina försäljningsfärdigheter baserat på ett transkriberat samtal. Svara på svenska.' :
                'You are a sales coach helping the user improve their sales skills based on a transcribed call. Respond in English.'
            },
            {
              role: 'system',
              content: `Here's the context for this call:\n${context}\n\nPrevious conversation:\n${
                (selectedHistoryItem.chatMessages || []).slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
              }`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Add AI response to chat
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessageData: ChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      // Update local state
      const finalUpdatedItem = {
        ...updatedItem,
        chatMessages: [...updatedItem.chatMessages, aiMessageData]
      };
      setSelectedHistoryItem(finalUpdatedItem);

      // Save to Firebase
      await setDoc(doc(db, 'transcriptions', selectedHistoryItem.id), {
        ...selectedHistoryItem,
        chatMessages: [...updatedItem.chatMessages, aiMessageData]
      }, { merge: true });

    } catch (error) {
      console.error('Error in chat:', error);
      // Add error message to chat
      const errorMessageId = (Date.now() + 2).toString();
      const errorMessageData: ChatMessage = {
        id: errorMessageId,
        role: 'assistant',
        content: settings.language === 'sv' ? 
          'Ett fel uppstod vid behandling av din förfrågan. Försök igen.' : 
          'An error occurred while processing your request. Please try again.',
        timestamp: new Date()
      };

      const errorUpdatedItem = {
        ...selectedHistoryItem,
        chatMessages: [...(selectedHistoryItem.chatMessages || []), errorMessageData]
      };
      setSelectedHistoryItem(errorUpdatedItem);

      await setDoc(doc(db, 'transcriptions', selectedHistoryItem.id), {
        ...selectedHistoryItem,
        chatMessages: [...(selectedHistoryItem.chatMessages || []), errorMessageData]
      }, { merge: true });
    } finally {
      setIsSendingChat(false);
    }
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current && activeTab === 'chat') {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedHistoryItem?.chatMessages, activeTab]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
        setShowSettings(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen text-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {settings.language === 'sv' ? 'Ljudtranskription' : 'Audio Transcription'}
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-[#383838] text-gray-300"
            aria-label={settings.language === 'sv' ? 'Inställningar' : 'Settings'}
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
        
        {/* Upload Section */}
        <div className="bg-[#282828] p-6 rounded-lg mb-8 shadow-lg">
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              {settings.language === 'sv' ? 'Välj ljudfil:' : 'Select Audio File:'}
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#404040] file:text-white
                hover:file:bg-[#505050]"
              disabled={isUploading}
            />
          </div>

          <button
            onClick={transcribeAudio}
            disabled={!audioFile || isUploading}
            className={`w-full py-2 rounded-md font-medium
              ${(!audioFile || isUploading) ? 'bg-[#305030] cursor-not-allowed' : 'bg-[#408040] hover:bg-[#50a050]'}
              transition-colors`}
          >
            {isUploading ? 
              (settings.language === 'sv' ? 'Transkriberar...' : 'Transcribing...') : 
              (settings.language === 'sv' ? 'Transkribera ljud' : 'Transcribe Audio')}
          </button>
        </div>

        {/* History Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            {settings.language === 'sv' ? 'Tidigare transkriptioner' : 'Previous Transcriptions'}
          </h2>
          
          {history.length === 0 ? (
            <div className="text-center py-6 bg-[#282828] rounded-lg">
              <p className="text-gray-400">
                {settings.language === 'sv' ? 'Ingen transkriptionshistorik ännu' : 'No transcription history yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map(item => (
                <div key={item.id} className="bg-[#282828] border border-[#383838] rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1 truncate text-white">{item.audioName}</h3>
                    <p className="text-sm text-gray-400 mb-2">{formatDate(item.timestamp)}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2 py-1 bg-[#404040] text-blue-300 rounded-full">
                        {item.language === 'sv' ? 'Svenska' : 'English'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openHistoryModal(item)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <span>{settings.language === 'sv' ? 'Visa' : 'View'}</span>
                        </button>
                        <button
                          onClick={() => deleteTranscription(item.id)}
                          disabled={isDeleting === item.id}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          {isDeleting === item.id ? (
                            settings.language === 'sv' ? 'Raderar...' : 'Deleting...'
                          ) : (
                            settings.language === 'sv' ? 'Radera' : 'Delete'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transcription Modal */}
        {selectedHistoryItem && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-[#282828] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#383838]">
              <div className="p-4 border-b border-[#383838] flex justify-between items-center">
                <h2 className="text-xl font-bold truncate text-white">{selectedHistoryItem.audioName}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteTranscription(selectedHistoryItem.id)}
                    disabled={isDeleting === selectedHistoryItem.id}
                    className="p-2 rounded-full hover:bg-[#383838] text-red-400"
                    aria-label={settings.language === 'sv' ? 'Radera' : 'Delete'}
                  >
                    {isDeleting === selectedHistoryItem.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <FiTrash2 className="w-5 h-5" />
                    )}
                  </button>
                  <button 
                    onClick={closeModal}
                    className="p-2 rounded-full hover:bg-[#383838] text-gray-300"
                    aria-label={settings.language === 'sv' ? 'Stäng' : 'Close'}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex border-b border-[#383838]">
                <button
                  onClick={() => setActiveTab('transcription')}
                  className={`px-4 py-2 font-medium ${activeTab === 'transcription' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
                >
                  {settings.language === 'sv' ? 'Transkription' : 'Transcription'}
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 font-medium ${activeTab === 'analysis' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
                >
                  {settings.language === 'sv' ? 'Analys' : 'Analysis'}
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 font-medium ${activeTab === 'chat' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
                >
                  {settings.language === 'sv' ? 'Coach-chatt' : 'Coach Chat'}
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4">
                {activeTab === 'transcription' ? (
                  <>
                    <div className="text-sm text-gray-400 mb-4">
                      <p>{settings.language === 'sv' ? 'Språk: ' : 'Language: '}<span className="text-white">{selectedHistoryItem.language === 'sv' ? 'Svenska' : 'English'}</span></p>
                      <p>{settings.language === 'sv' ? 'Datum: ' : 'Date: '}<span className="text-white">{formatDate(selectedHistoryItem.timestamp)}</span></p>
                    </div>
                    <h3 className="text-lg font-medium mb-4 text-white">
                      {settings.language === 'sv' ? 'Transkription:' : 'Transcription:'}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {selectedHistoryItem.transcription.map((segment, index) => (
                        <div 
                          key={index} 
                          className="p-3 rounded-xl bg-[#383838] max-w-[80%] self-start"
                        >
                          <div className="text-xs text-gray-400 mb-1 flex justify-between">
                            <span>{segment.speaker}</span>
                            <span>{formatTime(segment.start)} - {formatTime(segment.end)}</span>
                          </div>
                          <div className="text-white">{segment.text}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : activeTab === 'analysis' ? (
                  <>
                    {selectedHistoryItem.analysis ? (
                      <div className="space-y-6">
                        {/* Score Section */}
                        <div className="bg-[#383838] p-4 rounded-lg">
                          <h3 className="text-lg font-medium mb-2 text-white">
                            {settings.language === 'sv' ? 'Sammanfattande bedömning' : 'Overall Assessment'}
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="text-4xl font-bold text-blue-400">
                              {selectedHistoryItem.analysis.score}/10
                            </div>
                            <div className="text-white">
                              {selectedHistoryItem.analysis.scoreExplanation}
                            </div>
                          </div>
                        </div>
                        
                        {/* Strengths Section */}
                        {selectedHistoryItem.analysis.strengths.length > 0 && (
                          <div className="bg-[#383838] p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2 text-white">
                              {settings.language === 'sv' ? 'Styrkor' : 'Strengths'}
                            </h3>
                            <div className="space-y-3">
                              {selectedHistoryItem.analysis.strengths.map((item, i) => (
                                <div key={i} className="bg-[#484848] p-3 rounded">
                                  <h4 className="font-medium text-blue-300">{item.title}</h4>
                                  <p className="text-white">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Weaknesses Section */}
                        {selectedHistoryItem.analysis.weaknesses.length > 0 && (
                          <div className="bg-[#383838] p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2 text-white">
                              {settings.language === 'sv' ? 'Förbättringsområden' : 'Areas for Improvement'}
                            </h3>
                            <div className="space-y-3">
                              {selectedHistoryItem.analysis.weaknesses.map((item, i) => (
                                <div key={i} className="bg-[#484848] p-3 rounded">
                                  <h4 className="font-medium text-orange-300">{item.title}</h4>
                                  <p className="text-white">{item.suggestion}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Lost Moments Section */}
                        {selectedHistoryItem.analysis.lostMoments.length > 0 && (
                          <div className="bg-[#383838] p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2 text-white">
                              {settings.language === 'sv' ? 'Kritiska ögonblick' : 'Critical Moments'}
                            </h3>
                            <div className="space-y-3">
                              {selectedHistoryItem.analysis.lostMoments.map((item, i) => (
                                <div key={i} className="bg-[#484848] p-3 rounded">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium text-red-300">{item.time}</h4>
                                  </div>
                                  <p className="text-white">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Framework Evaluation */}
                        {selectedHistoryItem.analysis.frameworkEvaluation && (
                          <div className="bg-[#383838] p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2 text-white">
                              {settings.language === 'sv' ? 'Ramverksutvärdering' : 'Framework Evaluation'}
                            </h3>
                            <p className="text-white">{selectedHistoryItem.analysis.frameworkEvaluation}</p>
                          </div>
                        )}
                        
                        {/* Recommendations */}
                        {selectedHistoryItem.analysis.recommendations.length > 0 && (
                          <div className="bg-[#383838] p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-2 text-white">
                              {settings.language === 'sv' ? 'Rekommendationer' : 'Recommendations'}
                            </h3>
                            <div className="space-y-3">
                              {selectedHistoryItem.analysis.recommendations.map((item, i) => (
                                <div key={i} className="bg-[#484848] p-3 rounded">
                                  <h4 className="font-medium text-green-300">{item?.action || ''}</h4>
                                  <p className="text-white">{item.benefit}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        {settings.language === 'sv' ? 'Ingen analys tillgänglig för detta samtal' : 'No analysis available for this call'}
                      </div>
                    )}
                  </>
                ) : (
                  // Chat Tab
                  <div className="h-full flex flex-col">
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto mb-4 space-y-4"
                    >
                      {selectedHistoryItem.chatMessages && selectedHistoryItem.chatMessages.length > 0 ? (
                        selectedHistoryItem.chatMessages.map((message) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-[#383838] text-white'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatDate(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          {settings.language === 'sv' ? 
                            'Ställ frågor till din AI-coach om detta samtal. Chatten kommer att baseras på transkriptionen och analysen.' : 
                            'Ask your AI coach questions about this call. The chat will be based on the transcription and analysis.'}
                        </div>
                      )}
                    </div>
                    
                    <form onSubmit={handleChatSubmit} className="mt-auto">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder={
                            settings.language === 'sv' ? 
                              'Fråga din AI-coach om detta samtal...' : 
                              'Ask your AI coach about this call...'
                          }
                          className="flex-1 p-2 bg-[#383838] border border-[#505050] rounded-md text-white"
                          disabled={isSendingChat}
                        />
                        <button
                          type="submit"
                          disabled={!chatMessage.trim() || isSendingChat}
                          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-[#404040] disabled:text-gray-500"
                        >
                          {isSendingChat ? (
                            <span>...</span>
                          ) : (
                            <FiSend className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {settings.language === 'sv' ? 
                          'AI-coachen kommer att svara baserat på samtalets transkription och analys.' : 
                          'The AI coach will respond based on the call transcription and analysis.'}
                      </p>
                    </form>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-[#383838] text-right">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#404040] hover:bg-[#505050] rounded-md text-white"
                >
                  {settings.language === 'sv' ? 'Stäng' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-[#282828] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#383838]">
              <div className="p-4 border-b border-[#383838] flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {settings.language === 'sv' ? 'Inställningar' : 'Settings'}
                </h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-[#383838] text-gray-300"
                  aria-label={settings.language === 'sv' ? 'Stäng' : 'Close'}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 font-medium text-white">
                      {settings.language === 'sv' ? 'Språk' : 'Language'}
                    </label>
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleSettingsChange}
                      className="w-full p-2 bg-[#404040] border border-[#505050] rounded-md text-white"
                    >
                      <option value="en">English</option>
                      <option value="sv">Svenska</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-white">
                      {settings.language === 'sv' ? 'Samtalstyp' : 'Call Type'}
                    </label>
                    <select
                      name="callType"
                      value={settings.callType}
                      onChange={handleSettingsChange}
                      className="w-full p-2 bg-[#404040] border border-[#505050] rounded-md text-white"
                    >
                      <option value="Discovery">{settings.language === 'sv' ? 'Upptäcktsamtal' : 'Discovery'}</option>
                      <option value="Demo">Demo</option>
                      <option value="Closing">{settings.language === 'sv' ? 'Avslutande samtal' : 'Closing'}</option>
                      <option value="Follow-up">{settings.language === 'sv' ? 'Uppföljning' : 'Follow-up'}</option>
                      <option value="Negotiation">{settings.language === 'sv' ? 'Förhandling' : 'Negotiation'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-white">
                      {settings.language === 'sv' ? 'Försäljningsramverk' : 'Sales Framework'}
                    </label>
                    <select
                      name="framework"
                      value={settings.framework}
                      onChange={handleSettingsChange}
                      className="w-full p-2 bg-[#404040] border border-[#505050] rounded-md text-white"
                    >
                      <option value="BANT">BANT</option>
                      <option value="SPIN">SPIN</option>
                      <option value="SNAP">SNAP</option>
                      <option value="MEDDICC">MEDDICC</option>
                      <option value="CUSTOM">{settings.language === 'sv' ? 'Anpassat' : 'Custom'}</option>
                    </select>
                    
                    {settings.framework === 'CUSTOM' && (
                      <div className="mt-4">
                        <label className="block mb-2 font-medium text-white">
                          {settings.language === 'sv' ? 'Anpassat ramverksnamn' : 'Custom Framework Name'}
                        </label>
                        <input
                          type="text"
                          name="customFramework"
                          value={settings.customFramework || ''}
                          onChange={handleSettingsChange}
                          className="w-full p-2 bg-[#404040] border border-[#505050] rounded-md text-white"
                          placeholder={settings.language === 'sv' ? 'Ange ditt ramverksnamn' : 'Enter your framework name'}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="useCustomPrompt"
                      id="useCustomPrompt"
                      checked={settings.useCustomPrompt}
                      onChange={handleSettingsChange}
                      className="h-4 w-4 rounded bg-[#404040] border-[#505050] text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="useCustomPrompt" className="ml-2 block text-sm text-white">
                      {settings.language === 'sv' ? 'Använd anpassad prompt' : 'Use custom prompt'}
                    </label>
                  </div>
                  
                  {settings.useCustomPrompt && (
                    <div>
                      <label className="block mb-2 font-medium text-white">
                        {settings.language === 'sv' ? 'Anpassad prompt' : 'Custom Prompt'}
                      </label>
                      <textarea
                        name="customPrompt"
                        value={settings.customPrompt || ''}
                        onChange={handleSettingsChange}
                        rows={6}
                        className="w-full p-2 bg-[#404040] border border-[#505050] rounded-md text-white"
                        placeholder={
                          settings.language === 'sv' ? 
                          'Ange din anpassade prompt för analys...' : 
                          'Enter your custom prompt for analysis...'
                        }
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        {settings.language === 'sv' ? 
                          'Prompterna bör instruera AI:n hur analysen ska göras. Använd platshållare som {transkription} för samtalstexten.' : 
                          'The prompt should instruct the AI how to analyze the call. Include placeholders like {transcription} for the call text.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-[#383838] text-right">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                >
                  {settings.language === 'sv' ? 'Spara inställningar' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}