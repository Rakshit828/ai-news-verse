// src/pages/SignupPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSignupMutation } from "@/hooks/useAuth";
import { Newspaper, Loader2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
    const signup = useSignupMutation();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signup.mutate({ firstName, lastName, email, password });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Newspaper size={24} />
                    </div>
                    <h1 className="auth-logo-text">AI News Verse</h1>
                </div>

                <h2 className="auth-heading">Create an account</h2>
                <p className="auth-subheading">Get started with AI News Verse</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-row">
                        <div className="auth-field">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>
                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <div className="auth-password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowPassword((p) => !p)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={signup.isPending}
                    >
                        {signup.isPending ? (
                            <>
                                <Loader2 size={16} className="spinner" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-switch-link">
                        Sign in
                    </Link>
                </p>
            </div>

            <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--color-bg-primary);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-xl);
          padding: 40px 36px;
          box-shadow: var(--shadow-lg);
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          justify-content: center;
        }

        .auth-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: var(--gradient-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-logo-text {
          font-size: 20px;
          font-weight: 800;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-heading {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-text-primary);
          text-align: center;
        }

        .auth-subheading {
          font-size: 14px;
          color: var(--color-text-secondary);
          text-align: center;
          margin-top: 4px;
          margin-bottom: 28px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .auth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .auth-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
        }

        .auth-field input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-md);
          background: var(--color-bg-input);
          color: var(--color-text-primary);
          font-size: 14px;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .auth-field input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }

        .auth-field input::placeholder {
          color: var(--color-text-tertiary);
        }

        .auth-password-wrapper {
          position: relative;
        }

        .auth-password-wrapper input {
          padding-right: 40px;
        }

        .auth-password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-fast);
        }

        .auth-password-toggle:hover {
          color: var(--color-text-primary);
        }

        .auth-submit {
          width: 100%;
          padding: 11px;
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-accent);
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
        }

        .auth-submit:hover:not(:disabled) {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-top: 24px;
        }

        .auth-switch-link {
          color: var(--color-accent);
          font-weight: 600;
          text-decoration: none;
        }

        .auth-switch-link:hover {
          text-decoration: underline;
        }

        .spinner {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
