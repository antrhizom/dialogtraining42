"use client";

import { useRef } from "react";
import { EvaluationData } from "./Evaluation";

interface CertificateProps {
  name: string;
  data: EvaluationData;
  topic: string;
  situation: string;
  person: string;
  date: string;
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) =>
        i < Math.round(count) ? "★" : "☆"
      ).join("")}
    </span>
  );
}

export default function Certificate({
  name,
  data,
  topic,
  situation,
  person,
  date,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const gradeLabel =
    data.gesamt >= 4.5
      ? "Ausgezeichnet"
      : data.gesamt >= 3.5
      ? "Sehr gut"
      : data.gesamt >= 2.5
      ? "Gut"
      : data.gesamt >= 1.5
      ? "Befriedigend"
      : "Teilgenommen";

  return (
    <>
      {/* Print button (hidden in print) */}
      <div className="flex justify-center mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold
            px-8 py-3 rounded-xl transition-colors shadow-md hover:shadow-lg
            flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Zertifikat drucken
        </button>
      </div>

      {/* Certificate (visible in print) */}
      <div
        ref={certRef}
        className="certificate-container mx-auto mt-6 bg-white rounded-2xl border-2 border-gray-200
          max-w-[700px] print:max-w-none print:border-0 print:rounded-none print:mt-0 print:shadow-none"
      >
        {/* Inner border for certificate look */}
        <div className="m-4 p-8 border-2 border-blue-300 rounded-xl relative print:m-6 print:p-10">
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-blue-500 text-sm font-medium tracking-widest uppercase mb-2">
              Dialogtrainerin
            </p>
            <h1 className="text-3xl font-bold text-gray-800 print:text-4xl">
              Zertifikat
            </h1>
            <div className="w-24 h-1 bg-blue-400 mx-auto mt-3 rounded-full" />
          </div>

          {/* Body */}
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm mb-2">Hiermit wird bestätigt, dass</p>
            <p className="text-2xl font-bold text-gray-800 mb-2 print:text-3xl">
              {name}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              erfolgreich einen Dialog absolviert hat
            </p>

            {/* Dialog details */}
            <div className="bg-blue-50 rounded-xl p-4 inline-block text-left mb-6 print:bg-blue-50">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <span className="text-gray-500">Thema:</span>
                <span className="font-medium text-gray-800">{topic}</span>
                <span className="text-gray-500">Situation:</span>
                <span className="font-medium text-gray-800">{situation}</span>
                <span className="text-gray-500">Gesprächspartner:</span>
                <span className="font-medium text-gray-800">{person}</span>
                <span className="text-gray-500">Datum:</span>
                <span className="font-medium text-gray-800">{date}</span>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-sm">
              <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">Grammatik</span>
                <span className="text-yellow-500 font-mono">
                  <Stars count={data.grammatik} />
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">Wortschatz</span>
                <span className="text-yellow-500 font-mono">
                  <Stars count={data.wortschatz} />
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">Kommunikation</span>
                <span className="text-yellow-500 font-mono">
                  <Stars count={data.kommunikation} />
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">Aufgabe</span>
                <span className="text-yellow-500 font-mono">
                  <Stars count={data.aufgabe} />
                </span>
              </div>
            </div>
          </div>

          {/* Overall grade */}
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl">
              <p className="text-sm opacity-80">Gesamtergebnis</p>
              <p className="text-2xl font-bold">
                {data.gesamt.toFixed(1)} / 5 — {gradeLabel}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end mt-10 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="w-40 border-b border-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Datum</p>
              <p className="text-sm text-gray-700">{date}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎓</div>
              <p className="text-xs text-gray-500">Dialogtrainerin</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-gray-400 mb-1" />
              <p className="text-xs text-gray-500">KI-Sprachtrainerin</p>
              <p className="text-sm text-gray-700">Anna</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
