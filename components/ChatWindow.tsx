"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <p className="text-lg font-medium">Drücke den Mikrofon-Button</p>
          <p className="text-sm">und beginne zu sprechen</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          audioUrl={msg.audioUrl}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
