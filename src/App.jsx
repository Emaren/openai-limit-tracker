import React, { useState, useEffect } from "react";
import { fetchModels } from "./api/openai";
import "./App.css";

// Retrieve API key securely from Vite's environment variables
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Define daily request limits per model for OpenAI Plus
const MODEL_LIMITS = {
  "o1-mini": 5000,
  "gpt-4.5-preview": 2000,
  "o3-mini-high": 3000,
  "o3-mini": 3000,
  "gpt-4o": 300 * 1440,  // Adjust based on OpenAI's rate limits
  "gpt-4-turbo": 300 * 1440,
  "gpt-4": 100 * 1440,
  "gpt-3.5-turbo": 3000 * 1440,
};

// Preferred model order
const PREFERRED_ORDER = [
  "o1-mini",
  "gpt-4.5-preview",
  "o3-mini-high",
  "o3-mini",
];

const loadRequestCounts = () => {
  return JSON.parse(localStorage.getItem("requestCounts")) || {};
};

function App() {
  const [models, setModels] = useState([]);
  const [requestCounts, setRequestCounts] = useState(loadRequestCounts);
  const [rateLimits, setRateLimits] = useState({});

  useEffect(() => {
    console.log("🔑 OpenAI API Key:", API_KEY);

    const getModels = async () => {
      const data = await fetchModels();
      if (data) {
        const sortedModels = [...data.data].sort((a, b) => {
          const indexA = PREFERRED_ORDER.indexOf(a.id);
          const indexB = PREFERRED_ORDER.indexOf(b.id);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
        });

        setModels(sortedModels);
        setRequestCounts((prev) => {
          const newCounts = {};
          sortedModels.forEach((model) => {
            newCounts[model.id] = prev[model.id] || 0;
          });
          return newCounts;
        });
      }
    };
    getModels();
  }, []);

  const updateRequestCount = (modelId) => {
    setRequestCounts((prev) => {
      const newCounts = { ...prev, [modelId]: (prev[modelId] || 0) + 1 };
      localStorage.setItem("requestCounts", JSON.stringify(newCounts));
      return newCounts;
    });
  };

  // Function to send a real API request and track rate limits
  const simulateRequest = async (modelId) => {
    try {
      console.log(`Simulating request for model: ${modelId}`);

      let endpoint = "https://api.openai.com/v1/chat/completions"; // Default for chat models
      let payload = {
        model: modelId,
        messages: [{ role: "user", content: "Test request from OpenAI Limit Tracker" }],
        max_tokens: 50,
      };

      if (modelId.includes("dall-e")) {
        endpoint = "https://api.openai.com/v1/images/generations";
        payload = { model: modelId, prompt: "A futuristic cityscape", n: 1, size: "1024x1024" };
      } else if (modelId.includes("audio") || modelId.includes("whisper")) {
        console.warn(`⚠️ Skipping ${modelId} since it is not valid in OpenAI's transcription API.`);
        return;
      } else if (modelId.includes("text-embedding") || modelId.includes("tts-")) {
        console.warn(`⚠️ Skipping ${modelId} since it requires a different API endpoint.`);
        return;
      } else if (!modelId.includes("gpt-")) {
        endpoint = "https://api.openai.com/v1/completions";
        payload = { model: modelId, prompt: "Test request from OpenAI Limit Tracker", max_tokens: 50 };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 404) {
          console.warn(`⚠️ Model ${modelId} not found. Removing from list.`);
          return;
        } else if (response.status === 500) {
          console.warn(`⚠️ Internal Server Error for ${modelId}. Retrying in 5 seconds...`);
          setTimeout(() => simulateRequest(modelId), 5000);
          return;
        }
        console.error(`API Request Failed: ${response.status} - ${response.statusText}`);
        console.error("Error details:", errorData);
        return;
      }

      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      console.log("Rate Limit Headers:", headers);

      const data = await response.json();
      console.log("API Response:", data);

      updateRequestCount(modelId);
      console.log(`✅ Request successful for ${modelId}`);
    } catch (error) {
      console.error("❌ Error making API request:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🚀 OpenAI Model Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => {
          const dailyLimit = MODEL_LIMITS[model.id] || "Unknown";
          const used = requestCounts[model.id] || 0;
          const remaining = dailyLimit !== "Unknown" ? dailyLimit - used : "N/A";
          const rateLimitInfo = rateLimits[model.id] || {};

          return (
            <div key={model.id} className="p-4 shadow rounded-lg bg-gray-100">
              <h2 className="font-bold text-xl">{model.id}</h2>
              <p className="text-sm">Owned by: {model.owned_by}</p>
              <p className="text-sm">
                Created: {new Date(model.created * 1000).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <strong>Daily Limit:</strong> {dailyLimit}
              </p>
              <p className="text-sm">
                <strong>Used:</strong> {used}
              </p>
              <p className="text-sm">
                <strong>Remaining:</strong> {remaining}
              </p>

              {rateLimitInfo.remainingRequests && (
                <div className="p-2 bg-gray-200 mt-2 rounded">
                  <h3 className="font-bold">Rate Limits</h3>
                  <p><strong>Requests Left:</strong> {rateLimitInfo.remainingRequests}</p>
                  <p><strong>Tokens Left:</strong> {rateLimitInfo.remainingTokens}</p>
                  <p><strong>Reset Time (Requests):</strong> {rateLimitInfo.resetRequests}</p>
                  <p><strong>Reset Time (Tokens):</strong> {rateLimitInfo.resetTokens}</p>
                </div>
              )}

              <button
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
                onClick={() => simulateRequest(model.id)}
              >
                Simulate API Request
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
