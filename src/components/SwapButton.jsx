export default function SwapButton({ onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:scale-105 transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 z-40 ${className}`}
      title="Swap Languages"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 transition-colors transform lg:rotate-0 rotate-90"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    </button>
  );
}
