import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { translationAPI } from "./services/api";
import { historyService } from "./services/firestoreService";
import { useAuth } from "./context/AuthContext";

import Header from "./components/Header";
import LanguageDropdown from "./components/LanguageDropdown";
import ActionButtons from "./components/ActionButtons";
import RiskIndicator from "./components/RiskIndicator";
import SwapButton from "./components/SwapButton";
import HistoryPanel from "./components/HistoryPanel";
import FeedbackModal from "./components/FeedbackModal";
import AuthModal from "./components/AuthModal";
import ResetPasswordModal from "./components/ResetPasswordModal";

export default function App() {
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("nepali");
  const [targetLang, setTargetLang] = useState("english");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(null);

  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

  // History & Feedback state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);
  const [isSaved, setIsSaved] = useState(false);    // true once current translation is saved
  const [savedDocId, setSavedDocId] = useState(null); // Firestore doc ID of the saved entry

  // Track the last translation for saving / feedback
  const [lastTranslation, setLastTranslation] = useState(null);

  // Auth modal & dismiss-able disclaimer
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Detect Firebase password-reset link params on mount
  const [resetOobCode, setResetOobCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "resetPassword") return params.get("oobCode") ?? null;
    return null;
  });
  const [showResetModal, setShowResetModal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "resetPassword" && !!params.get("oobCode");
  });

  const languages = [
    { code: "nepali", label: "Nepali" },
    { code: "sinhala", label: "Sinhala" },
    { code: "english", label: "English" },
  ];

  const handleTranslate = async (currentText, currentSource, currentTarget) => {
    if (!currentText.trim()) {
      setResult("");
      setRiskScore(null);
      setLastTranslation(null);
      return;
    }

    try {
      setLoading(true);

      const data = await translationAPI.translateText(
        currentText,
        currentSource,
        currentTarget
      );

      setResult(data.translated_text);
      setRiskScore(data.cultural_risk_score);
      setIsSaved(false);    // reset saved state for each new translation
      setSavedDocId(null);

      // Store last translation details for save/feedback
      setLastTranslation({
        sourceText: currentText,
        translatedText: data.translated_text,
        sourceLang: currentSource,
        targetLang: currentTarget,
        culturalRiskScore: data.cultural_risk_score ?? 0,
      });
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
    setLastTranslation(null);
    setIsSaved(false);
    setSavedDocId(null);
  };

  // Toggle save/unsave for current translation
  const handleSaveToHistory = async () => {
    if (!user) {
      toast.error("Sign in to save translations.");
      return;
    }
    if (!lastTranslation) return;

    setSavingHistory(true);
    try {
      if (isSaved && savedDocId) {
        // ── Unsave: delete the Firestore entry ──────────────────────────────
        await historyService.deleteOne(user.uid, savedDocId);
        setIsSaved(false);
        setSavedDocId(null);
        toast.success("Removed from history.");
      } else {
        // ── Save: create the Firestore entry ───────────────────────────────
        const docId = await historyService.save(user.uid, lastTranslation);
        setIsSaved(true);
        setSavedDocId(docId);
        toast.success("Translation saved to history!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update history. Please try again.");
    } finally {
      setSavingHistory(false);
    }
  };

  // Restore a history item back to the translator
  const handleRestore = (item) => {
    setText(item.sourceText);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setResult(item.translatedText);
    setRiskScore(item.culturalRiskScore ?? null);
    setIsSaved(true);       // restored from history = already saved
    setSavedDocId(item.id); // store its doc ID so the star can unsave it
    setLastTranslation({
      sourceText: item.sourceText,
      translatedText: item.translatedText,
      sourceLang: item.sourceLang,
      targetLang: item.targetLang,
      culturalRiskScore: item.culturalRiskScore ?? 0,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
      <Toaster position="top-center" reverseOrder={false} />

      <Header onHistoryOpen={() => setHistoryOpen(true)} />

      {/* ── Guest login disclaimer banner ─────────────────────────────────── */}
      {!user && !bannerDismissed && (
        <div className="w-full bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-b border-blue-200/60 dark:border-blue-800/40 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-blue-600 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </span>
              <p className="text-sm text-blue-800 dark:text-blue-200 truncate">
                <span className="font-semibold">Sign in to save your translations.</span>
                <span className="hidden sm:inline text-blue-700/80 dark:text-blue-300/80"> Your history is private and synced across devices.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss"
                className="p-1 rounded-full text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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

          {/* Right Panel: Output */}
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
                    <div className="flex items-center gap-1">
                      <ActionButtons result={result} />

                      {/* ★ Save / Unsave toggle button */}
                      <button
                        onClick={handleSaveToHistory}
                        disabled={savingHistory || !lastTranslation}
                        title={
                          !user ? "Sign in to save"
                            : isSaved ? "Click to remove from history"
                              : "Save to history"
                        }
                        className={`p-1.5 transition-colors rounded-full border border-transparent
                          disabled:cursor-not-allowed
                          ${isSaved
                            ? "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800"
                            : "text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-800 hover:border-amber-100 dark:hover:border-gray-700 disabled:opacity-40"
                          }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill={isSaved || savingHistory ? "#f59e0b" : "none"}
                          stroke={isSaved ? "#f59e0b" : "currentColor"}
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>

                      {/* 💬 Feedback button */}
                      {user && lastTranslation && (
                        <button
                          onClick={() => setFeedbackOpen(true)}
                          title="Give feedback"
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors rounded-full border border-transparent hover:border-blue-100 dark:hover:border-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                          </svg>
                        </button>
                      )}
                    </div>
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

      {/* History slide-in panel */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
      />

      {/* Feedback modal */}
      {lastTranslation && (
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          sourceText={lastTranslation.sourceText}
          translatedText={lastTranslation.translatedText}
          sourceLang={lastTranslation.sourceLang}
          targetLang={lastTranslation.targetLang}
        />
      )}

      {/* Auth modal (also accessible from disclaimer banner) */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* In-app Firebase password reset handler */}
      {showResetModal && resetOobCode && (
        <ResetPasswordModal
          oobCode={resetOobCode}
          onDone={() => {
            setShowResetModal(false);
            setAuthModalOpen(true); // open sign-in modal after reset
          }}
        />
      )}
    </div>
  );
}