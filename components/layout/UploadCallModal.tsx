import { useAudioTranscriber } from "@/context/AudioTranscriberProvider";
import { Loader2 } from "lucide-react";
import React from "react";
import { FiFileText, FiUpload, FiX } from "react-icons/fi";

export default function UploadCallModal() {
  const {
    audioFile,
    isUploading,
    fileInputRef,
    isDragging,
    setShowUploadModal,
    handleFileChange,
    transcribeAudio,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,

    setAudioFile,
  } = useAudioTranscriber();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 z-50 ">
      <div className="Shadow-xl w-full max-w-md flex flex-col   border border-[#1E1F21] rounded-lg p-2 mt-6 bg-[#141414]">
        <div className="p-3  flex justify-between items-center">
          <h2 className="text-xl text-white ">Ladda upp samtal</h2>
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
            {isUploading ? (
              <Loader2 className=" h-4 w-4 animate-spin text-center" />
            ) : (
              "Ladda upp samtal"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
