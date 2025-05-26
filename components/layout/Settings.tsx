import { useAudioTranscriber } from '@/context/AudioTranscriberProvider'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import React from 'react'
import { FiX } from 'react-icons/fi'
import { Button } from '../ui/button'

export default function Settings() {
    const { setShowSettings, settings,handleSettingsChange  } = useAudioTranscriber()
  return (

          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 z-50">
            <div className="bg-[#141414] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#1E1F21] ">
              <div className="p-4  flex justify-between items-center">
                <h2 className="text-xl text-white">Inställningar</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-[#2a2a2a] text-primary"
                  aria-label="Stäng"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  <div>
                    <label className="block mb-2 text-white">
                      Språk
                    </label>
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleSettingsChange}
                      className="w-full p-3 bg-[#1E1F21]  rounded-lg text-white"
                    >
                      <option value="en">English</option>
                      <option value="sv">Svenska</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-400">
                      Detta påverkar språket för transkribering, analys och
                      chatt.
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 text-white">
                      Samtalstyp
                    </label>
                    <select
                      name="callType"
                      value={settings.callType}
                      onChange={handleSettingsChange}
                      className="w-full p-3 bg-[#1E1F21] rounded-lg text-white"
                    >
                      <option value="Discovery">Upptäckt</option>
                      <option value="Demo">Demo</option>
                      <option value="Closing">Avslut</option>
                      <option value="Follow-up">Uppföljning</option>
                      <option value="Negotiation">Förhandling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2  text-white">
                      Försäljningsramverk
                    </label>
                    <select
                      name="framework"
                      value={settings.framework}
                      onChange={handleSettingsChange}
                      className="w-full p-3 bg-[#1E1F21]  rounded-lg text-white"
                    >
                      <option value="BANT">BANT</option>
                      <option value="SPIN">SPIN</option>
                      <option value="SNAP">SNAP</option>
                      <option value="MEDDICC">MEDDICC</option>
                      <option value="CUSTOM">Anpassat</option>
                    </select>

                    {settings.framework === "CUSTOM" && (
                      <div className="mt-4">
                        <label className="block mb-2 font-medium text-white">
                          Anpassat ramverksnamn
                        </label>
                        <input
                          type="text"
                          name="customFramework"
                          value={settings.customFramework || ""}
                          onChange={handleSettingsChange}
                          className="w-full p-3 bg-[#2a2a2a] border border-[#2d2d30] rounded-lg text-white"
                          placeholder="Ange ditt ramverksnamn"
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
                      className="h-4 w-4 rounded bg-[#2a2a2a] border-[#2d2d30] text-blue-500 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="useCustomPrompt"
                      className="ml-2 block text-sm text-white"
                    >
                      Använd anpassad prompt
                    </label>
                  </div>

                  {settings.useCustomPrompt && (
                    <div>
                      <label className="block mb-2 font-medium text-white">
                        Anpassad prompt
                      </label>
                      <textarea
                        name="customPrompt"
                        value={settings.customPrompt || ""}
                        onChange={handleSettingsChange}
                        rows={6}
                        className="w-full p-3 bg-[#1E1F21] rounded-lg text-white"
                        placeholder="Ange din anpassade prompt för analys..."
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Prompterna bör instruera AI:n hur analysen ska göras.
                        Använd platshållare som {"{transcription}"} för
                        samtalstexten.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4  text-right">
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-primary text-black transition-all duration-300 ease-in-out p-2 px-3 rounded-xl "
                >
                  Spara inställningar
                </button>
              </div>
            </div>
          </div>

  )
}
