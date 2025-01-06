"use client";

import { createContext, useContext, useState, ReactNode, useRef } from "react";

interface DeepgramContextType {
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  realtimeTranscript: string;
  error: string | null;
}

export const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

const getApiKey = async (): Promise<string> => {
  const response = await fetch("/api/deepgram/transcribe-audio", { cache: "no-store" });
  const result = await response.json();
  return result.key;
};

export const DeepgramProvider = ({ children }: DeepgramContextProviderProps) => {
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const connectToDeepgram = async () => {
    try {
      setError(null);
      setRealtimeTranscript("");

      // Get microphone permission and create audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Get Deepgram API key
      const apiKey = await getApiKey();

      // Create WebSocket connection
      const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
        "token",
        apiKey,
      ]);

      // Store socket reference
      socketRef.current = socket;

      // Set up WebSocket event handlers
      socket.onopen = () => {
        console.log("WebSocket connection opened");
        
        // Create and start MediaRecorder once socket is open
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        mediaRecorder.start(250);
      };

      socket.onmessage = (message) => {
        try {
          const received = JSON.parse(message.data);
          const transcript = received.channel?.alternatives[0]?.transcript || "";
          if (transcript) {
            setRealtimeTranscript(prev => prev + " " + transcript);
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      socket.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Error connecting to Deepgram");
        disconnectFromDeepgram();
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

    } catch (err) {
      console.error("Error setting up recording:", err);
      setError("Error setting up recording");
    }
  };

  const disconnectFromDeepgram = () => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close WebSocket connection
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
  };

  return (
    <DeepgramContext.Provider
      value={{
        connectToDeepgram,
        disconnectFromDeepgram,
        realtimeTranscript,
        error,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

export function useDeepgram() {
  const context = useContext(DeepgramContext);
  if (!context) {
    throw new Error("useDeepgram must be used within a DeepgramProvider");
  }
  return context;
}
