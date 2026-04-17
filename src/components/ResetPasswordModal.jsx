import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  sendPasswordResetEmail,
} from "firebase/auth";

const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

/* ── status: "verifying" | "valid" | "invalid" | "success" ─────────────────── */
export default function ResetPasswordModal({ oobCode, onDone }) {
  const [status, setStatus]     = useState("verifying"); // check code on mount
  const [email, setEmail]       = useState("");           // email linked to the code

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Resend state
  const [resendEmail, setResendEmail]     = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone]       = useState(false);
  const [resendError, setResendError]     = useState("");

  // ── Verify the oobCode as soon as the component mounts ─────────────────────
  useEffect(() => {
    if (!oobCode) { setStatus("invalid"); return; }
    verifyPasswordResetCode(auth, oobCode)
      .then((linkedEmail) => {
        setEmail(linkedEmail);
        setResendEmail(linkedEmail);
        setStatus("valid");
      })
      .catch((err) => {
        console.error("[ResetPassword] verifyPasswordResetCode failed:", err?.code, err?.message);
        setStatus("invalid");
      });
  }, [oobCode]);

  // ── Submit new password ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      window.history.replaceState({}, document.title, window.location.pathname);
      setStatus("success");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Resend reset email ──────────────────────────────────────────────────────
  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    setResendError("");
    try {
      // No actionCodeSettings here — Firebase Console action URL handles the link destination
      await sendPasswordResetEmail(auth, resendEmail.trim());
      setResendDone(true);
    } catch (err) {
      console.error("[ResetPassword] sendPasswordResetEmail failed:", err?.code, err?.message);
      const map = {
        "auth/invalid-email":          "Please enter a valid email address.",
        "auth/user-not-found":         "No account found with this email.",
        "auth/too-many-requests":      "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Check your connection.",
        "auth/unauthorized-domain":    "This domain is not authorized in Firebase. Contact support.",
      };
      setResendError(map[err?.code] ?? `Error: ${err?.code ?? "unknown"}. Please try again.`);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto scrollbar-none py-6 px-4"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-modal-in">
        {/* Gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="px-8 py-8 flex flex-col gap-5">

          {/* ── Icon + title ─────────────────────────────────────────────────── */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg mb-3 ${
              status === "invalid" ? "bg-gradient-to-br from-red-400 to-orange-500"
              : status === "success" ? "bg-gradient-to-br from-green-400 to-emerald-600"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}>
              {status === "invalid" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : status === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {status === "verifying" ? "Verifying link…"
                : status === "invalid" ? "Link expired or invalid"
                : status === "success" ? "Password reset!"
                : "Set new password"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {status === "verifying" ? "Please wait a moment"
                : status === "invalid" ? "This reset link has expired or was already used"
                : status === "success" ? "You can now sign in with your new password"
                : `Setting password for ${email}`}
            </p>
          </div>

          {/* ── Verifying spinner ─────────────────────────────────────────────── */}
          {status === "verifying" && (
            <div className="flex justify-center py-4">
              <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}

          {/* ── Invalid / expired — resend form ──────────────────────────────── */}
          {status === "invalid" && (
            resendDone ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex items-start gap-2 w-full px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  New reset link sent! Check your inbox and spam folder.
                </div>
                <button
                  onClick={onDone}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResend} className="flex flex-col gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Enter your email and we'll send a fresh reset link.
                </p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
                />
                {/* Resend error */}
                {resendError && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {resendError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {resendLoading && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Send New Reset Link
                </button>
                <button type="button" onClick={onDone} className="text-sm text-center text-blue-600 dark:text-blue-400 hover:underline">
                  ← Back to Sign In
                </button>
              </form>
            )
          )}

          {/* ── Valid — new password form ─────────────────────────────────────── */}
          {status === "valid" && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowPwd(v => !v)}>
                    <EyeIcon open={showPwd} />
                  </span>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showCfm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowCfm(v => !v)}>
                    <EyeIcon open={showCfm} />
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12V8.25z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Reset Password
              </button>
            </form>
          )}

          {/* ── Success ───────────────────────────────────────────────────────── */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-green-600 dark:text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Your password has been updated. Sign in with your new password.
              </p>
              <button
                onClick={onDone}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all"
              >
                Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    "auth/expired-action-code": "This reset link has expired. Please request a new one.",
    "auth/invalid-action-code": "This reset link is invalid or already used.",
    "auth/user-disabled":       "This account has been disabled.",
    "auth/user-not-found":      "No account found for this email.",
    "auth/weak-password":       "Password must be at least 6 characters.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}
