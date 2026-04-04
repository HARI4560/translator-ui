export default function RiskIndicator({ riskScore }) {
  if (riskScore === null || riskScore === undefined) return null;

  const isHighRisk = riskScore > 0.5;
  const isMediumRisk = riskScore > 0;

  const colorClasses = isHighRisk
    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30"
    : isMediumRisk
    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30"
    : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30";

  const dotColor = isHighRisk ? "bg-red-500" : isMediumRisk ? "bg-yellow-500" : "bg-green-500 text-green-400";

  return (
    <div className="group relative flex items-center justify-end">
      <div
        className={`py-1.5 px-2 rounded-full shadow-sm border flex items-center justify-center transition-all duration-300 ease-in-out cursor-help hover:px-3 gap-2 ${colorClasses}`}
      >
        <span className={`w-2.5 h-2.5 flex-shrink-0 rounded-full ${dotColor}`}></span>
        <span className="text-[11px] font-bold whitespace-nowrap overflow-hidden w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 ease-in-out">
          Cultural Risk: {riskScore}
        </span>
      </div>
    </div>
  );
}
