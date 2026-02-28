"use client";

import { useEffect, useRef, useCallback } from "react";

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface MicButtonProps {
  voiceState: VoiceState;
  onRecordingComplete: (audioBlob: Blob) => void;
  onStartListening: () => void;
  onStopListening: () => void;
}

export default function MicButton({
  voiceState,
  onRecordingComplete,
  onStartListening,
  onStopListening,
}: MicButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Start/stop recording based on voiceState
  useEffect(() => {
    if (voiceState === "listening") {
      startRecording();
    } else {
      // If we were recording, stop
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    }

    return () => {
      if (voiceState !== "listening") {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceState]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Set up silence detection via AudioAnalyser
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();

        // Only send if there's actual audio data
        if (blob.size > 1000) {
          onRecordingComplete(blob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // collect chunks every 250ms

      // Start silence detection
      detectSilence(analyser);
    } catch (err) {
      console.error("Mikrofon-Zugriff verweigert:", err);
      alert(
        "Bitte erlaube den Mikrofon-Zugriff in deinen Browser-Einstellungen."
      );
    }
  };

  const detectSilence = (analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let silenceStart: number | null = null;
    const SILENCE_THRESHOLD = 15; // volume level considered silence
    const SILENCE_DURATION = 1800; // ms of silence before stopping
    let hasSpoken = false;

    const check = () => {
      analyser.getByteFrequencyData(dataArray);
      const average =
        dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

      if (average > SILENCE_THRESHOLD) {
        // User is speaking
        hasSpoken = true;
        silenceStart = null;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (hasSpoken && !silenceStart) {
        // Silence just started after user spoke
        silenceStart = Date.now();
        silenceTimerRef.current = setTimeout(() => {
          // Silence long enough → stop recording
          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }, SILENCE_DURATION);
      }

      animFrameRef.current = requestAnimationFrame(check);
    };

    animFrameRef.current = requestAnimationFrame(check);
  };

  const handleClick = () => {
    if (voiceState === "idle") {
      onStartListening();
    } else if (voiceState === "listening") {
      // Manual stop
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } else if (voiceState === "speaking" || voiceState === "processing") {
      onStopListening();
    }
  };

  const stateConfig = {
    idle: {
      color: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300",
      label: "Gespräch starten",
      icon: "mic",
    },
    listening: {
      color: "bg-red-500 hover:bg-red-600 focus:ring-red-300 mic-pulse",
      label: "Ich höre zu...",
      icon: "waves",
    },
    processing: {
      color: "bg-amber-500 focus:ring-amber-300",
      label: "Anna denkt nach...",
      icon: "dots",
    },
    speaking: {
      color: "bg-purple-500 focus:ring-purple-300",
      label: "Anna spricht...",
      icon: "speaker",
    },
  };

  const config = stateConfig[voiceState];

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-300 focus:outline-none focus:ring-4
          ${config.color}
        `}
        title={config.label}
      >
        {/* Mic icon */}
        {config.icon === "mic" && (
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}

        {/* Listening waves */}
        {config.icon === "waves" && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-white rounded-full animate-bounce"
                style={{
                  height: `${12 + Math.random() * 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        )}

        {/* Processing dots */}
        {config.icon === "dots" && (
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}

        {/* Speaker icon */}
        {config.icon === "speaker" && (
          <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>

      <p className="text-sm text-gray-500 mt-3 font-medium">
        {config.label}
      </p>

      {voiceState !== "idle" && (
        <button
          onClick={onStopListening}
          className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Gespräch beenden
        </button>
      )}
    </div>
  );
}
