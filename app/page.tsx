"use client";

import { useState, useCallback, useRef } from "react";
import ChatWindow, { Message } from "@/components/ChatWindow";
import MicButton, { VoiceState } from "@/components/MicButton";
import Evaluation, { EvaluationData } from "@/components/Evaluation";
import { TOPICS, Topic, Situation, Person } from "@/lib/scenarios";

type AppScreen =
  | "select-topic"
  | "select-situation"
  | "select-person"
  | "dialog"
  | "evaluating"
  | "evaluation";

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("select-topic");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSituation, setSelectedSituation] =
    useState<Situation | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [evaluationData, setEvaluationData] =
    useState<EvaluationData | null>(null);
  const messagesRef = useRef<Message[]>([]);

  const updateMessages = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      setMessages((prev) => {
        const next = updater(prev);
        messagesRef.current = next;
        return next;
      });
    },
    []
  );

  // ─── Audio processing pipeline ───
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

        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages,
            personality: selectedPerson?.personality ?? "",
            situationContext: selectedSituation?.context ?? "",
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

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          audioUrl,
        };
        updateMessages((prev) => [...prev, assistantMsg]);

        if (!audioUrl) {
          setVoiceState("listening");
        }
      } catch (error) {
        console.error("Fehler:", error);
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Entschuldigung, es gab ein technisches Problem. Bitte versuche es nochmal.",
        };
        updateMessages((prev) => [...prev, errorMsg]);
        setVoiceState("listening");
      }
    },
    [selectedPerson, selectedSituation, updateMessages]
  );

  const handleAudioEnd = useCallback(() => {
    setVoiceState("listening");
  }, []);

  // ─── Dialog end + Evaluation ───
  const endDialog = useCallback(async () => {
    setVoiceState("idle");
    setScreen("evaluating");

    try {
      const chatMessages = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          scenario: selectedTopic?.label ?? "",
          situation: selectedSituation?.label ?? "",
          person: selectedPerson?.label ?? "",
        }),
      });

      if (!res.ok) throw new Error("Bewertung fehlgeschlagen");
      const { evaluation } = await res.json();
      setEvaluationData(evaluation);
      setScreen("evaluation");
    } catch (error) {
      console.error("Evaluation error:", error);
      setScreen("dialog");
      alert("Bewertung konnte nicht erstellt werden. Bitte versuche es nochmal.");
    }
  }, [selectedTopic, selectedSituation, selectedPerson]);

  // ─── Navigation ───
  const restart = useCallback(() => {
    setScreen("select-topic");
    setSelectedTopic(null);
    setSelectedSituation(null);
    setSelectedPerson(null);
    setMessages([]);
    messagesRef.current = [];
    setVoiceState("idle");
    setEvaluationData(null);
  }, []);

  const goBack = useCallback(() => {
    if (screen === "select-situation") {
      setScreen("select-topic");
      setSelectedTopic(null);
    } else if (screen === "select-person") {
      setScreen("select-situation");
      setSelectedPerson(null);
    } else if (screen === "dialog") {
      if (messages.length > 0) {
        if (confirm("Dialog abbrechen? Der Fortschritt geht verloren.")) {
          restart();
        }
      } else {
        setScreen("select-person");
        setVoiceState("idle");
      }
    }
  }, [screen, messages.length, restart]);

  // ─── Render: Topic selection ───
  if (screen === "select-topic") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Dialogtrainerin
            </h1>
            <p className="text-lg text-gray-500">
              Wähle ein Thema für deinen Dialog
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTopic(t);
                  setScreen("select-situation");
                }}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left
                  hover:border-blue-400 hover:shadow-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.icon}</span>
                  <p className="text-lg font-semibold text-gray-800">
                    {t.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Situation selection ───
  if (screen === "select-situation" && selectedTopic) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl w-full">
          <button
            onClick={goBack}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>

          <div className="text-center mb-8">
            <span className="text-4xl mb-2 block">{selectedTopic.icon}</span>
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedTopic.label}
            </h2>
            <p className="text-gray-500 mt-1">Wähle eine Situation</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {selectedTopic.situations.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSituation(s);
                  setScreen("select-person");
                }}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left
                  hover:border-blue-400 hover:shadow-md transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-[0.98]"
              >
                <p className="font-semibold text-gray-800">{s.label}</p>
                <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Person selection ───
  if (screen === "select-person" && selectedTopic) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl w-full">
          <button
            onClick={goBack}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>

          <div className="text-center mb-8">
            <span className="text-4xl mb-2 block">👤</span>
            <h2 className="text-2xl font-bold text-gray-800">
              Gesprächspartner wählen
            </h2>
            <p className="text-gray-500 mt-1">
              {selectedTopic.label} — {selectedSituation?.label}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {selectedTopic.persons.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPerson(p);
                  setMessages([]);
                  messagesRef.current = [];
                  setScreen("dialog");
                }}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left
                  hover:border-purple-400 hover:shadow-md transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-400 active:scale-[0.98]"
              >
                <p className="font-semibold text-gray-800">{p.label}</p>
                <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Dialog ───
  if (screen === "dialog") {
    return (
      <main className="h-screen flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
          <button
            onClick={goBack}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-700 text-sm">
              {selectedPerson?.label}
            </p>
            <p className="text-xs text-gray-400">
              {selectedSituation?.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {voiceState !== "idle" && (
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  voiceState === "listening"
                    ? "bg-red-500 animate-pulse"
                    : voiceState === "processing"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-purple-500 animate-pulse"
                }`}
              />
            )}
          </div>
        </header>

        {/* Chat */}
        <ChatWindow messages={messages} onLastAudioEnd={handleAudioEnd} />

        {/* Bottom controls */}
        <div className="flex flex-col items-center pb-6 pt-4 bg-white border-t shrink-0 gap-3">
          <div className="flex items-center gap-6">
            {/* End Dialog button */}
            {messages.length >= 2 && (
              <button
                onClick={endDialog}
                disabled={voiceState === "processing"}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs">Bewerten</span>
              </button>
            )}

            {/* Mic button */}
            <MicButton
              voiceState={voiceState}
              onRecordingComplete={processAudio}
              onStartListening={() => setVoiceState("listening")}
              onStopListening={() => setVoiceState("idle")}
            />

            {/* Pause/Stop voice button */}
            {voiceState !== "idle" && (
              <button
                onClick={() => setVoiceState("idle")}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </div>
                <span className="text-xs">Pause</span>
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: Evaluating (loading) ───
  if (screen === "evaluating") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Dein Dialog wird ausgewertet...
          </h2>
          <p className="text-gray-400 mt-2">Einen Moment bitte</p>
        </div>
      </main>
    );
  }

  // ─── Render: Evaluation ───
  if (screen === "evaluation" && evaluationData) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
        <Evaluation
          data={evaluationData}
          topic={selectedTopic?.label ?? ""}
          situation={selectedSituation?.label ?? ""}
          person={selectedPerson?.label ?? ""}
          onRestart={restart}
        />
      </main>
    );
  }

  return null;
}
