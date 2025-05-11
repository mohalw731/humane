'use client';

import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiX } from 'react-icons/fi';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/configs/firebase';

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  speaker: string;
}

interface TranscriptionHistoryItem {
  id: string;
  timestamp: Date;
  language: string;
  audioName: string;
  transcription: TranscriptionSegment[];
  rawText: string;
  userId?: string;
}

export default function AudioTranscriber({ apiKey, userId }: { apiKey: string; userId?: string }) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [language, setLanguage] = useState<'sv' | 'en'>('sv');
  const [history, setHistory] = useState<TranscriptionHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<TranscriptionHistoryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'transcriptions'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: TranscriptionHistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          timestamp: data.timestamp.toDate(),
          language: data.language,
          audioName: data.audioName,
          transcription: data.transcription,
          rawText: data.rawText,
          userId: data.userId
        });
      });
      setHistory(items);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      alert('Please select an audio file');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
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

  const transcribeAudio = async () => {
    if (!audioFile) {
      alert('Please select an audio file first');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('language', language);
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

      // Save to Firebase (without audio URL)
      const newItem = {
        timestamp: new Date(),
        language,
        audioName: audioFile.name,
        transcription: formattedTranscription,
        rawText: fullText,
        userId: userId || null
      };

      await saveToFirebase(newItem as TranscriptionHistoryItem);

      setAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Error transcribing audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const openHistoryModal = (item: TranscriptionHistoryItem) => {
    setSelectedHistoryItem(item);
  };

  const closeModal = () => {
    setSelectedHistoryItem(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#181818] text-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Audio Transcription</h1>
        
        {/* Upload Section */}
        <div className="bg-[#282828] p-6 rounded-lg mb-8 shadow-lg">
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Select Audio File:
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

          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Language:
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'sv' | 'en')}
              className="w-full p-2 bg-[#404040] border border-[#505050] rounded-md text-white"
              disabled={isUploading}
            >
              <option value="sv">Swedish</option>
              <option value="en">English</option>
            </select>
          </div>

          <button
            onClick={transcribeAudio}
            disabled={!audioFile || isUploading}
            className={`w-full py-2 rounded-md font-medium
              ${(!audioFile || isUploading) ? 'bg-[#305030] cursor-not-allowed' : 'bg-[#408040] hover:bg-[#50a050]'}
              transition-colors`}
          >
            {isUploading ? 'Transcribing...' : 'Transcribe Audio'}
          </button>
        </div>

        {/* History Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Previous Transcriptions</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-6 bg-[#282828] rounded-lg">
              <p className="text-gray-400">No transcription history yet</p>
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
                        {item.language === 'sv' ? 'Swedish' : 'English'}
                      </span>
                      <button
                        onClick={() => openHistoryModal(item)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <span>View</span>
                      </button>
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
                <button 
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-[#383838] text-gray-300"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-[#383838]">
                <div className="text-sm text-gray-400">
                  <p>Language: <span className="text-white">{selectedHistoryItem.language === 'sv' ? 'Swedish' : 'English'}</span></p>
                  <p>Date: <span className="text-white">{formatDate(selectedHistoryItem.timestamp)}</span></p>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-4">
                <h3 className="text-lg font-medium mb-4 text-white">Transcription:</h3>
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
              </div>
              
              <div className="p-4 border-t border-[#383838] text-right">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#404040] hover:bg-[#505050] rounded-md text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}