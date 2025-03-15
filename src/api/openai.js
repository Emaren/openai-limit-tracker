const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("⚠️ API Key is missing! Check .env and restart Vite.");
}

export const fetchModels = async () => {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { "Authorization": `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("❌ Error fetching models:", error);
    return null;
  }
};
