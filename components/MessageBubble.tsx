"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

export default function MessageBubble({
  role,
  content,
  audioUrl,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-500 text-white rounded-br-md"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
        }`}
      >
        {!isUser && (
          <p className="text-xs font-semibold text-purple-600 mb-1">
            Anna 🎓
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {audioUrl && (
          <audio
            src={audioUrl}
            autoPlay
            controls
            className="mt-2 w-full h-8"
          />
        )}
      </div>
    </div>
  );
}
