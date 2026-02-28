import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAI();
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Keine Audiodatei erhalten" },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      language: "de",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("STT error:", error);
    return NextResponse.json(
      { error: "Spracherkennung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
