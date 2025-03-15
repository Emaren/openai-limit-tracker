export const fetchModels = async () => {
  try {
    const response = await fetch("/api/models", { method: "GET" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching models:", error);
    return null;
  }
};
