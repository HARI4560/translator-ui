import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

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

/* ─── Input field ───────────────────────────────────────────────────────────── */
function Input({ label, id, type = "text", value, onChange, placeholder, autoComplete, rightEl, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all
            ${error
              ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700"
              : "border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
            } ${rightEl ? "pr-10" : ""}`}
        />
        {rightEl && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 cursor-pointer">
            {rightEl}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}

/* ─── Divider ───────────────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium select-none">or</span>
      <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════════════════════════════════════════ */
export default function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, sendPasswordReset } = useAuth();

  // tabs: "signin" | "register" | "forgot"
  const [tab, setTab] = useState("signin");

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);

  // ui state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccess] = useState("");
  const [globalErr, setGlobalErr] = useState("");

  const overlayRef = useRef(null);

  // reset on tab change
  useEffect(() => {
    setErrors({}); setSuccess(""); setGlobalErr("");
    setName(""); setEmail(""); setPassword(""); setConfirm("");
    setShowPwd(false); setShowCfm(false);
  }, [tab, isOpen]);

  // lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ── validation ──────────────────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email.";

    if (tab !== "forgot") {
      if (!password) errs.password = "Password is required.";
      else if (password.length < 6) errs.password = "At least 6 characters.";
    }

    if (tab === "register") {
      if (!name.trim()) errs.name = "Name is required.";
      if (password && confirm !== password) errs.confirm = "Passwords do not match.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── submit ──────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setGlobalErr(""); setSuccess("");

    try {
      if (tab === "signin") {
        await signInWithEmail(email, password);
        onClose();
      } else if (tab === "register") {
        await registerWithEmail(email, password, name.trim());
        onClose();
      } else if (tab === "forgot") {
        await sendPasswordReset(email);
        setSuccess("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      setGlobalErr(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGlobalErr("");
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setGlobalErr(friendlyError(err.code));
    }
  };

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] overflow-y-auto scrollbar-none py-6 px-4"
      style={{ scrollbarWidth: 'none' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-modal-in">

        {/* ── Header gradient strip ───────────────────────────────────────────── */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* ── Close button ────────────────────────────────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 pt-6 pb-8 flex flex-col gap-5">
          {/* ── Brand ────────────────────────────────────────────────────────── */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {tab === "signin" ? "Welcome back" : tab === "register" ? "Create account" : "Reset password"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {tab === "signin"
                ? "Sign in to save your translation history"
                : tab === "register"
                  ? "Join CulturaTranslate for free"
                  : "We'll send a reset link to your email"}
            </p>
          </div>

          {/* ── Tabs (sign in / register only) ──────────────────────────────── */}
          {tab !== "forgot" && (
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              {[["signin", "Sign In"], ["register", "Register"]].map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${tab === t
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── Google button ───────────────────────────────────────────────── */}
          {tab !== "forgot" && (
            <button
              onClick={handleGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          )}

          {tab !== "forgot" && <Divider />}

          {/* ── Form ────────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {tab === "register" && (
              <Input
                label="Full Name"
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                error={errors.name}
              />
            )}

            <Input
              label="Email address"
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />

            {tab !== "forgot" && (
              <Input
                label="Password"
                id="auth-password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={tab === "register" ? "new-password" : "current-password"}
                error={errors.password}
                rightEl={
                  <span onClick={() => setShowPwd((v) => !v)}>
                    <EyeIcon open={showPwd} />
                  </span>
                }
              />
            )}

            {tab === "register" && (
              <Input
                label="Confirm Password"
                id="auth-confirm"
                type={showCfm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirm}
                rightEl={
                  <span onClick={() => setShowCfm((v) => !v)}>
                    <EyeIcon open={showCfm} />
                  </span>
                }
              />
            )}

            {/* ── Forgot password link ─────────────────────────────────────── */}
            {tab === "signin" && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => setTab("forgot")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* ── Global error / success ───────────────────────────────────── */}
            {globalErr && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {globalErr}
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-600 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {successMsg}
              </div>
            )}

            {/* ── Submit ───────────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {tab === "signin" ? "Sign In" : tab === "register" ? "Create Account" : "Send Reset Link"}
            </button>

            {/* ── Back to sign in (from forgot) ────────────────────────────── */}
            {tab === "forgot" && (
              <button
                type="button"
                onClick={() => setTab("signin")}
                className="text-sm text-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* ── Disclaimer ──────────────────────────────────────────────────── */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed -mt-1">
            By signing in, you agree to our{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Firebase error → readable message ─────────────────────────────────────── */
function friendlyError(code) {
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}
