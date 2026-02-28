"use client";

import { useState, useCallback } from "react";
import ChatWindow, { Message } from "@/components/ChatWindow";
import MicButton from "@/components/MicButton";

const SCENARIOS = [
  { id: "restaurant", label: "🍽️ Im Restaurant", desc: "Einen Tisch reservieren und bestellen" },
  { id: "arzt", label: "🏥 Beim Arzt", desc: "Einen Termin machen und Symptome beschreiben" },
  { id: "supermarkt", label: "🛒 Im Supermarkt", desc: "Einkaufen und nach Produkten fragen" },
  { id: "weg", label: "🗺️ Nach dem Weg fragen", desc: "Wegbeschreibungen verstehen und geben" },
  { id: "vorstellung", label: "💼 Vorstellungsgespräch", desc: "Sich vorstellen und Fragen beantworten" },
  { id: "frei", label: "💬 Freies Gespräch", desc: "Über ein beliebiges Thema sprechen" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [scenario, setScenario] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      if (isProcessing) return;
      setIsProcessing(true);

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
          setIsProcessing(false);
          return;
        }

        // Add user message
        const userMsg: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: userText,
        };
        setMessages((prev) => [...prev, userMsg]);

        // 2. Chat completion
        const chatMessages = [...messages, userMsg].map((m) => ({
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
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: reply }),
        });

        let audioUrl: string | undefined;
        if (ttsRes.ok) {
          const audioBlob = await ttsRes.blob();
          audioUrl = URL.createObjectURL(audioBlob);
        }

        // Add assistant message
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          audioUrl,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error("Fehler:", error);
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Entschuldigung, es gab ein technisches Problem. Bitte versuche es nochmal.",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsProcessing(false);
      }
    },
    [messages, scenario, isProcessing]
  );

  const selectScenario = useCallback((id: string) => {
    setScenario(id);
    setMessages([]);
  }, []);

  const resetChat = useCallback(() => {
    setScenario(null);
    setMessages([]);
  }, []);

  // Scenario selection screen
  if (!scenario) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Sprachtrainerin
            </h1>
            <p className="text-lg text-gray-500">
              Wähle ein Szenario und übe Deutsch im Dialog mit Anna
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => selectScenario(s.id)}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left
                  hover:border-blue-400 hover:shadow-md transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <p className="text-xl font-semibold mb-1">{s.label}</p>
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
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
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
        <div className="w-16" />
      </header>

      {/* Chat */}
      <ChatWindow messages={messages} />

      {/* Mic area */}
      <div className="flex flex-col items-center pb-8 pt-4 bg-gray-50 border-t">
        {isProcessing && (
          <p className="text-sm text-gray-400 mb-3 animate-pulse">
            Anna denkt nach...
          </p>
        )}
        <MicButton
          onRecordingComplete={processAudio}
          disabled={isProcessing}
        />
        <p className="text-xs text-gray-400 mt-3">
          {isProcessing
            ? "Bitte warten..."
            : "Drücke zum Sprechen"}
        </p>
      </div>
    </main>
  );
}
