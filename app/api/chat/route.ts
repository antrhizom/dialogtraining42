import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, personality, situationContext } = (await req.json()) as {
      messages: ChatMessage[];
      personality: string;
      situationContext: string;
    };

    const systemContent = `${personality}

Situation: ${situationContext}

Wichtige Regeln für das Rollenspiel:
- Bleibe konsequent in deiner Rolle und Persönlichkeit
- Antworte IMMER auf Deutsch
- Verwende natürliche, gesprochene Sprache (Niveau A2-B1)
- Halte deine Antworten kurz (2-3 Sätze)
- Stelle Folgefragen, um das Gespräch weiterzuführen
- Korrigiere KEINE Fehler des Lernenden (das macht die Bewertung später)
- Reagiere natürlich auf das, was der Lernende sagt
- Beginne das Gespräch passend zur Situation`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "Entschuldigung, ich konnte keine Antwort generieren.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Chat-Antwort fehlgeschlagen" },
      { status: 500 }
    );
  }
}
