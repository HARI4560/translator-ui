import { useState, useEffect } from "react";
import { adminService, contactService } from "../../services/firestoreService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut, user } = useAuth();

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="flex-1 w-full bg-white dark:bg-gray-950 flex flex-col md:flex-row overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 shadow-sm z-10 pt-[73px] md:pt-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-3xl shadow-md">
            {user?.displayName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="text-center w-full min-w-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{user?.displayName || "Admin User"}</p>
            {/* <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{user?.email}</p> */}
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
          <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">Dashboard</TabButton>
          <TabButton active={activeTab === "messages"} onClick={() => setActiveTab("messages")} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">Messages</TabButton>
          <TabButton active={activeTab === "feedback"} onClick={() => setActiveTab("feedback")} icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z">Feedback Logs</TabButton>
          <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">Settings</TabButton>
        </nav>
        <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-800">
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 flex flex-col">
        <div className="h-[73px] w-full flex-shrink-0 hidden md:block" />
        <div className="p-6 md:p-10 flex-1">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "messages" && <MessagesView />}
          {activeTab === "feedback" && <FeedbackView />}
          {activeTab === "settings" && <SettingsView isDark={isDark} toggleTheme={toggleTheme} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active
        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-600"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        {icon.length > 100 && <circle cx="12" cy="12" r="3" />}
      </svg>
      {children}
    </button>
  );
}

function DashboardView() {
  const [metrics, setMetrics] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardMetrics(),
      adminService.getTopFeedbackUsers()
    ]).then(([m, users]) => {
      setMetrics(m);
      setTopUsers(users);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and engagement metrics.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MetricCard title="Total Registered Users" value={metrics?.totalUsers || 0} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
            <MetricCard title="Total Feedback Items" value={metrics?.totalFeedback || 0} icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
            <MetricCard title="Contact Messages" value={metrics?.totalMessages || 0} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top 10 Feedback Contributors</h4>
            {topUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No feedback data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="pb-3 font-medium px-4">Rank</th>
                      <th className="pb-3 font-medium px-4">Name</th>
                      <th className="pb-3 font-medium px-4">Email</th>
                      <th className="pb-3 font-medium px-4 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((u, idx) => (
                      <tr key={u.email} className="border-b last:border-0 border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-4 text-gray-900 dark:text-gray-200">
                          {idx === 0 ? <span className="text-xl">🥇</span> : idx === 1 ? <span className="text-xl">🥈</span> : idx === 2 ? <span className="text-xl">🥉</span> : `#${idx + 1}`}
                        </td>
                        <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">{u.name}</td>
                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            {u.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h4 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h4>
      </div>
    </div>
  );
}

function MessagesView() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contactService.getAll().then((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review inquiries and support requests.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">
            No messages found.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{msg.subject}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{msg.name}</span> &lt;{msg.email}&gt;
                  </p>
                </div>
                <div className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : "Just now"}
                </div>
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FeedbackView() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllFeedback().then((f) => {
      setFeedbacks(f);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Logs</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze user feedback to improve translation quality.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl" />)}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400">
            No feedback found.
          </div>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    {item.userName?.[0] || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.userName || "Anonymous"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.userEmail || "No email provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.rating >= 4 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.rating === 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {"⭐".repeat(item.rating || 0) || "No Rating"}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleDateString() : ""}
                  </span>
                </div>
              </div>

              {item.comment && (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold block mb-1">User Comment:</span>
                  {item.comment}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    Source ({item.sourceLang})
                  </span>
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{item.sourceText}</p>
                </div>
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl">
                  <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2 block">
                    Translation ({item.targetLang})
                  </span>
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{item.translatedText}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SettingsView({ isDark, toggleTheme }) {
  const { user, sendPasswordReset } = useAuth();

  const handlePasswordReset = async () => {
    try {
      await sendPasswordReset(user.email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reset email.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage appearance and account security.</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Toggle between light and dark mode.</p>
          </div>
          <button
            role="switch"
            aria-checked={isDark}
            onClick={toggleTheme}
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${isDark ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${isDark ? "translate-x-7" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Account Security</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Change your administrator password securely.</p>
          </div>
          <button
            onClick={handlePasswordReset}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-md transition-all whitespace-nowrap"
          >
            Send Reset Email
          </button>
        </div>
      </div>
    </div>
  );
}
