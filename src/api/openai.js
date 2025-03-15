export const fetchModels = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/models`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching models:", error);
    return null;
  }
};
