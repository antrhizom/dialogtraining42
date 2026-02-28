import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `Du bist eine freundliche und geduldige Deutsch-Sprachtrainerin namens "Anna".
Deine Aufgabe ist es, mit Deutschlernenden Dialoge zu üben.

Regeln:
- Antworte immer auf Deutsch
- Verwende einfache, klare Sätze (Niveau A2-B1)
- Wenn der Lernende einen Fehler macht, korrigiere ihn sanft und erkläre kurz warum
- Bleibe im Rollenspiel des gewählten Szenarios
- Stelle Folgefragen, um das Gespräch am Laufen zu halten
- Sei ermutigend und positiv
- Halte deine Antworten kurz (2-4 Sätze)
- Wenn kein Szenario gewählt wurde, frage den Lernenden, was er üben möchte`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, scenario } = (await req.json()) as {
      messages: ChatMessage[];
      scenario?: string;
    };

    const systemContent = scenario
      ? `${SYSTEM_PROMPT}\n\nAktuelles Szenario: ${scenario}. Beginne das Rollenspiel passend zu diesem Szenario.`
      : SYSTEM_PROMPT;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "Entschuldigung, ich konnte keine Antwort generieren.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Chat-Antwort fehlgeschlagen" },
      { status: 500 }
    );
  }
}
