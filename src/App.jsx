import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { translationAPI } from "./services/api";

import Header from "./components/Header";
import LanguageDropdown from "./components/LanguageDropdown";
import ActionButtons from "./components/ActionButtons";
import RiskIndicator from "./components/RiskIndicator";
import SwapButton from "./components/SwapButton";

export default function App() {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("nepali");
  const [targetLang, setTargetLang] = useState("english");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(null);

  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

  const languages = [
    { code: "nepali", label: "Nepali" },
    { code: "sinhala", label: "Sinhala" },
    { code: "english", label: "English" },
  ];

  const handleTranslate = async (currentText, currentSource, currentTarget) => {
    if (!currentText.trim()) {
      setResult("");
      setRiskScore(null);
      return;
    }

    try {
      setLoading(true);

      // Call the centralized service instead of direct axios
      const data = await translationAPI.translateText(
        currentText,
        currentSource,
        currentTarget
      );

      setResult(data.translated_text);
      setRiskScore(data.cultural_risk_score);
    } catch (err) {
      console.error(err);
      toast.error("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setText(result);
    setResult("");
    setRiskScore(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
      <Toaster position="top-center" reverseOrder={false} />

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row flex-1 min-h-[500px] relative transition-colors duration-200">

          {/* Middle: Swap Button (Desktop) */}
          <div className="hidden lg:flex absolute inset-y-0 left-1/2 -ml-px w-px bg-gray-200 dark:bg-gray-800 z-30 flex-col py-4 mt-2 mb-4">
            <SwapButton
              onClick={handleSwap}
              className="top-8 -ml-6 transform -translate-y-1/2"
            />
          </div>

          {/* Left Panel: Input */}
          <div className="flex-1 flex flex-col w-full border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:rounded-l-2xl overflow-hidden transition-colors">
            <div className="px-6 py-4 flex items-center lg:justify-start gap-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 min-h-[76px] z-20 transition-colors">
              <LanguageDropdown
                languages={languages}
                selectedLang={sourceLang}
                onSelectLang={setSourceLang}
                isOpen={sourceDropdownOpen}
                setIsOpen={setSourceDropdownOpen}
                closeOther={() => setTargetDropdownOpen(false)}
              />
            </div>

            <div className="flex-1 p-6 relative flex flex-col">
              <textarea
                className="flex-1 w-full bg-transparent border-none resize-none text-gray-800 dark:text-gray-100 text-lg sm:text-xl placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 outline-none overflow-y-auto"
                placeholder="Enter text to translate..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {text && (
                <button
                  onClick={() => setText("")}
                  className="absolute top-6 right-6 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Clear text"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs font-medium ${text.length > 500 ? 'text-red-500 dark:text-red-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                  {text.length} / 500 characters
                </span>
                {text.length > 500 && (
                  <span className="text-xs text-red-500 dark:text-red-400 font-medium ml-2 mr-auto">
                    Only the first 500 characters can be translated at once.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Middle: Swap Button (Mobile) */}
          <div className="lg:hidden relative flex justify-center items-center h-12 w-full bg-gray-50 dark:bg-gray-800/80 border-y border-gray-200 dark:border-gray-800 z-30 transition-colors">
            <SwapButton onClick={handleSwap} />
          </div>

          {/* Right Panel: Output Textarea */}
          <div className="flex-1 flex flex-col w-full bg-gray-50/30 dark:bg-gray-900 lg:rounded-r-2xl overflow-hidden transition-colors">
            <div className="lg:pl-8 px-6 py-4 flex items-center gap-4 border-t lg:border-t-0 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 min-h-[76px] z-10 w-full relative transition-colors">
              <LanguageDropdown
                languages={languages}
                selectedLang={targetLang}
                onSelectLang={setTargetLang}
                isOpen={targetDropdownOpen}
                setIsOpen={setTargetDropdownOpen}
                closeOther={() => setSourceDropdownOpen(false)}
              />

              <button
                onClick={() => handleTranslate(text, sourceLang, targetLang)}
                disabled={loading || !text.trim() || text.length > 500}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? "Translating" : "Translate"}
              </button>
            </div>

            <div className="flex-1 p-6 relative flex flex-col min-h-0">
              {result ? (
                <div className="flex-1 text-gray-800 dark:text-gray-100 text-lg sm:text-xl whitespace-pre-wrap flex flex-col overflow-y-auto max-h-full">
                  {result}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <p className="text-center font-medium">Translation will appear here</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-2 relative min-h-[32px]">
                {result ? (
                  <>
                    <ActionButtons result={result} />
                    <RiskIndicator riskScore={riskScore} />
                  </>
                ) : (
                  <div className="w-full h-8"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}