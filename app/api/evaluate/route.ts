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
    const openai = getOpenAI();
    const { messages, scenario, situation, person } = (await req.json()) as {
      messages: ChatMessage[];
      scenario: string;
      situation: string;
      person: string;
    };

    const evaluation = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Du bist ein erfahrener Deutsch-Sprachlehrer und bewertest einen Dialog eines Deutschlernenden.

Der Dialog fand statt in folgendem Kontext:
- Thema: ${scenario}
- Situation: ${situation}
- Gesprächspartner: ${person}

Bewerte den Dialog des Lernenden (die "user"-Nachrichten) nach folgenden Kriterien und gib für jedes eine Note von 1-5 Sternen:

1. **Grammatik** ⭐: Wie korrekt war die Grammatik? (Satzbau, Verbkonjugation, Fälle)
2. **Wortschatz** 📚: Wurde passender und vielfältiger Wortschatz verwendet?
3. **Kommunikation** 💬: Wie gut wurde kommuniziert? (Verständlichkeit, Höflichkeit, Angemessenheit)
4. **Aufgabenbewältigung** 🎯: Wurde die Situation erfolgreich gemeistert?

Gib danach:
- **Gesamtnote**: Durchschnitt der 4 Kriterien (1-5 Sterne)
- **Stärken**: 2-3 konkrete Dinge, die gut waren
- **Verbesserungen**: 2-3 konkrete Tipps mit Beispielen aus dem Dialog
- **Korrigierte Sätze**: Falls Fehler vorhanden, zeige die korrigierte Version

Antworte auf Deutsch. Sei ermutigend aber ehrlich. Formatiere die Antwort klar und übersichtlich.

WICHTIG: Antworte in folgendem JSON-Format:
{
  "grammatik": 3,
  "wortschatz": 4,
  "kommunikation": 4,
  "aufgabe": 3,
  "gesamt": 3.5,
  "staerken": ["Punkt 1", "Punkt 2"],
  "verbesserungen": ["Tipp 1", "Tipp 2"],
  "korrekturen": [{"original": "falsch", "korrektur": "richtig", "erklaerung": "warum"}],
  "zusammenfassung": "Kurzes ermutigendes Fazit"
}`,
        },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const reply = evaluation.choices[0]?.message?.content ?? "{}";

    try {
      const parsed = JSON.parse(reply);
      return NextResponse.json({ evaluation: parsed });
    } catch {
      return NextResponse.json({ evaluation: { zusammenfassung: reply } });
    }
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Bewertung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
