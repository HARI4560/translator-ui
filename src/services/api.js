import axios from "axios";

// Configure base URL for backend connection
// This makes it easy to change from localhost to a production server later
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

export const translationAPI = {
    /**
     * Translates text between Nepali and Sinhala using the AI backend
     * @param {string} text - Text to translate
     * @param {string} source_lang - Source language code ("nepali" or "sinhala")
     * @param {string} target_lang - Target language code ("english", "nepali", or "sinhala")
     * @returns {Promise<{translated_text: string, cultural_risk_score: number}>}
     */
    translateText: async (text, source_lang, target_lang) => {
        try {
            const response = await API.post("/translate", {
                text,
                source_lang,
                target_lang,
            });
            return response.data;
        } catch (error) {
            console.error("API Error during translation:", error);
            throw error; // Re-throw to be handled by the UI component
        }
    },
};
