import ThemeToggle from "./ThemeToggle";

export default function Header() {
    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Cultural Translator
                    </h1>
                </div>
                
                <div className="flex items-center">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
