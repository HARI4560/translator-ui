export default function Footer({ onContactOpen }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* ── Brand ──────────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-gray-900 dark:text-white">CulturaTranslate</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Bridging cultures through AI-powered translation that understands context, nuance, and cultural meaning.
            </p>
          </div>

          {/* ── Quick Links ────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Home", href: "#", onClick: null },
                { label: "Contact Us", href: "#", onClick: onContactOpen },
              ].map(({ label, href, onClick }) => (
                <li key={label}>
                  <a
                    href={href}
                    onClick={(e) => { e.preventDefault(); onClick?.(); }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:ml-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact snippet ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Get in Touch</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Have feedback, a bug to report, or a partnership idea? We'd love to hear from you.
            </p>
            <button
              onClick={onContactOpen}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 w-fit active:scale-[0.97]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact Us
            </button>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {year} CulturaTranslate. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 dark:text-gray-500">Built with ❤️ for cultural understanding</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
