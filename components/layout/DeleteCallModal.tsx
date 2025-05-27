'use client'
import { useAudioTranscriber } from '@/context/AudioTranscriberProvider';
import React from 'react'
import { Button } from '../ui/button';
import { FiX } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

export default function DeleteCallModal() {

      const {

        isDeleting,

        itemToDelete,

        confirmDeleteTranscription,

        setShowDeleteConfirmation,
      } = useAudioTranscriber();
  return (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-3 z-50">
            <div className=" rounded-lg p-2 bg-[#18181B] w-full max-w-md">
              <div className=" p-3  flex justify-between items-center">
                <h2 className="text-xl  text-white">Bekräfta borttagning</h2>
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
                  {isDeleting === itemToDelete ? (
                    <Loader2 className=" h-4 w-4 animate-spin" />
                  ) : (
                    "Ta bort"
                  )}
                </Button>
              </div>
            </div>
          </div>
  )
}
