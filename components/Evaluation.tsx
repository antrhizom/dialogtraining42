"use client";

export interface EvaluationData {
  grammatik: number;
  wortschatz: number;
  kommunikation: number;
  aufgabe: number;
  gesamt: number;
  staerken: string[];
  verbesserungen: string[];
  korrekturen: { original: string; korrektur: string; erklaerung: string }[];
  zusammenfassung: string;
}

interface EvaluationProps {
  data: EvaluationData;
  onRestart: () => void;
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-lg ${
            i < Math.round(count) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ScoreBar({
  label,
  icon,
  score,
}: {
  label: string;
  icon: string;
  score: number;
}) {
  const percentage = (score / 5) * 100;
  const color =
    score >= 4
      ? "bg-green-500"
      : score >= 3
      ? "bg-yellow-500"
      : score >= 2
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-8">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <Stars count={score} />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Evaluation({ data, onRestart }: EvaluationProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">
          {data.gesamt >= 4 ? "🎉" : data.gesamt >= 3 ? "👍" : "💪"}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Dialog-Bewertung</h2>
        <p className="text-gray-500 mt-1">{data.zusammenfassung}</p>
      </div>

      {/* Overall score */}
      <div className="bg-white rounded-2xl border p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Gesamtnote</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-bold text-gray-800">
            {data.gesamt.toFixed(1)}
          </span>
          <span className="text-2xl text-gray-400">/ 5</span>
        </div>
        <div className="flex justify-center mt-2">
          <Stars count={data.gesamt} />
        </div>
      </div>

      {/* Individual scores */}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 mb-2">Einzelbewertung</h3>
        <ScoreBar label="Grammatik" icon="⭐" score={data.grammatik} />
        <ScoreBar label="Wortschatz" icon="📚" score={data.wortschatz} />
        <ScoreBar label="Kommunikation" icon="💬" score={data.kommunikation} />
        <ScoreBar label="Aufgabenbewältigung" icon="🎯" score={data.aufgabe} />
      </div>

      {/* Strengths */}
      {data.staerken?.length > 0 && (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>✅</span> Das hast du gut gemacht
          </h3>
          <ul className="space-y-2">
            {data.staerken.map((s, i) => (
              <li
                key={i}
                className="text-sm text-green-700 flex items-start gap-2"
              >
                <span className="mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {data.verbesserungen?.length > 0 && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>💡</span> Tipps zur Verbesserung
          </h3>
          <ul className="space-y-2">
            {data.verbesserungen.map((v, i) => (
              <li
                key={i}
                className="text-sm text-blue-700 flex items-start gap-2"
              >
                <span className="mt-0.5">•</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Corrections */}
      {data.korrekturen?.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <span>📝</span> Korrekturen
          </h3>
          <div className="space-y-3">
            {data.korrekturen.map((k, i) => (
              <div key={i} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="line-through text-red-500">
                    {k.original}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-medium">
                    {k.korrektur}
                  </span>
                </div>
                <p className="text-amber-700 text-xs ml-4">{k.erklaerung}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restart button */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <button
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold
            px-8 py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          Neuen Dialog starten
        </button>
      </div>
    </div>
  );
}
