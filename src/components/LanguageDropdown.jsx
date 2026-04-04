import { useEffect, useRef } from "react";

export default function LanguageDropdown({ 
  languages, 
  selectedLang, 
  onSelectLang, 
  isOpen, 
  setIsOpen, 
  closeOther 
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) closeOther();
  };

  return (
    <div className="relative w-full sm:w-auto z-10" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full sm:w-40 flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-3 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] font-semibold focus:outline-none hover:border-gray-400 dark:hover:border-gray-600 transition-all cursor-pointer ring-1 ring-transparent"
      >
        {languages.find(l => l.code === selectedLang)?.label}
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 py-1.5 overflow-hidden backdrop-blur-md">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLang(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${
                selectedLang === lang.code
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
