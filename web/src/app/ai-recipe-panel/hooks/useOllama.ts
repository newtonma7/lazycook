// hooks/useOllama.ts
"use client";
import { useState, useEffect } from "react";

export function useOllama() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  const checkOllama = async () => {
    try {
      setOllamaStatus("checking");
      const res = await fetch("http://127.0.0.1:11434/api/tags");
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
        if (data.models?.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0].name);
        }
        setOllamaStatus("connected");
      } else {
        setOllamaStatus("disconnected");
      }
    } catch {
      setOllamaStatus("disconnected");
    }
  };

  useEffect(() => {
    checkOllama();
    const interval = setInterval(checkOllama, 10000);
    return () => clearInterval(interval);
  }, []);

  return { models, selectedModel, setSelectedModel, ollamaStatus, checkOllama };
}