"use client";

import { useState, useCallback, useRef } from "react";
import ChatWindow, { Message } from "@/components/ChatWindow";
import MicButton, { VoiceState } from "@/components/MicButton";

const SCENARIOS = [
  { id: "restaurant", label: "Im Restaurant", desc: "Einen Tisch reservieren und bestellen" },
  { id: "arzt", label: "Beim Arzt", desc: "Einen Termin machen und Symptome beschreiben" },
  { id: "supermarkt", label: "Im Supermarkt", desc: "Einkaufen und nach Produkten fragen" },
  { id: "weg", label: "Nach dem Weg fragen", desc: "Wegbeschreibungen verstehen und geben" },
  { id: "vorstellung", label: "Vorstellungsgespräch", desc: "Sich vorstellen und Fragen beantworten" },
  { id: "frei", label: "Freies Gespräch", desc: "Über ein beliebiges Thema sprechen" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [scenario, setScenario] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const messagesRef = useRef<Message[]>([]);

  // Keep ref in sync for use in callbacks
  const updateMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
    setMessages((prev) => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      setVoiceState("processing");

      try {
        // 1. Speech-to-Text
        const sttForm = new FormData();
        sttForm.append("audio", audioBlob, "recording.webm");

        const sttRes = await fetch("/api/stt", {
          method: "POST",
          body: sttForm,
        });

        if (!sttRes.ok) throw new Error("Spracherkennung fehlgeschlagen");
        const { text: userText } = await sttRes.json();

        if (!userText.trim()) {
          // No speech detected → go back to listening
          setVoiceState("listening");
          return;
        }

        // Add user message
        const userMsg: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: userText,
        };
        updateMessages((prev) => [...prev, userMsg]);

        // 2. Chat completion
        const chatMessages = [...messagesRef.current].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const selectedScenario = scenario
          ? SCENARIOS.find((s) => s.id === scenario)?.label
          : undefined;

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages,
            scenario: selectedScenario,
          }),
        });

        if (!chatRes.ok) throw new Error("Chat fehlgeschlagen");
        const { reply } = await chatRes.json();

        // 3. Text-to-Speech
        setVoiceState("speaking");

        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: reply }),
        });

        let audioUrl: string | undefined;
        if (ttsRes.ok) {
          const audioData = await ttsRes.blob();
          audioUrl = URL.createObjectURL(audioData);
        }

        // Add assistant message (audio will autoplay)
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          audioUrl,
        };
        updateMessages((prev) => [...prev, assistantMsg]);

        // If no audio, go back to listening directly
        if (!audioUrl) {
          setVoiceState("listening");
        }
        // Otherwise, onLastAudioEnd will trigger "listening"
      } catch (error) {
        console.error("Fehler:", error);
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Entschuldigung, es gab ein technisches Problem. Bitte versuche es nochmal.",
        };
        updateMessages((prev) => [...prev, errorMsg]);
        // Go back to listening after error
        setVoiceState("listening");
      }
    },
    [scenario, updateMessages]
  );

  // Called when Anna's audio finishes playing → auto-listen again
  const handleAudioEnd = useCallback(() => {
    setVoiceState("listening");
  }, []);

  const handleStartListening = useCallback(() => {
    setVoiceState("listening");
  }, []);

  const handleStopListening = useCallback(() => {
    setVoiceState("idle");
  }, []);

  const selectScenario = useCallback((id: string) => {
    setScenario(id);
    setMessages([]);
    messagesRef.current = [];
  }, []);

  const resetChat = useCallback(() => {
    setScenario(null);
    setMessages([]);
    messagesRef.current = [];
    setVoiceState("idle");
  }, []);

  // Scenario selection screen
  if (!scenario) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Dialogtrainerin
            </h1>
            <p className="text-lg text-gray-500">
              Wähle ein Szenario und übe Deutsch im Gespräch mit Anna
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Sprich einfach — Anna hört zu, antwortet und hört dann wieder zu
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => selectScenario(s.id)}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left
                  hover:border-blue-400 hover:shadow-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  active:scale-[0.98]"
              >
                <p className="text-lg font-semibold mb-1">{s.label}</p>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Chat screen
  return (
    <main className="h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <button
          onClick={resetChat}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </button>
        <h2 className="font-semibold text-gray-700">
          {SCENARIOS.find((s) => s.id === scenario)?.label}
        </h2>
        {/* Voice state indicator */}
        <div className="flex items-center gap-2">
          {voiceState !== "idle" && (
            <span className={`w-2.5 h-2.5 rounded-full ${
              voiceState === "listening" ? "bg-red-500 animate-pulse" :
              voiceState === "processing" ? "bg-amber-500 animate-pulse" :
              "bg-purple-500 animate-pulse"
            }`} />
          )}
        </div>
      </header>

      {/* Chat */}
      <ChatWindow
        messages={messages}
        onLastAudioEnd={handleAudioEnd}
      />

      {/* Mic area */}
      <div className="flex flex-col items-center pb-6 pt-4 bg-white border-t shrink-0">
        <MicButton
          voiceState={voiceState}
          onRecordingComplete={processAudio}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
        />
      </div>
    </main>
  );
}
