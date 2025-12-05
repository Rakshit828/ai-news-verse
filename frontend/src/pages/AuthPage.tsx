import type { LoginFormData, RegisterFormData } from "../types/auth.types";
import { useState, useEffect } from "react";
import { Sparkles, Newspaper, Zap, Shield } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { useToast } from "../context/ToastContext";
import { FullScreenLoader } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserCreateSchema, UserLogInSchema } from "../types/api.types";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { login, signup, loading: authLoading, isAuthenticated } = useAuth();

  // Watch for authentication state change and redirect
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLocalLoading(true);
    try {
      // Transform LoginFormData to UserLogInSchema
      const loginPayload: UserLogInSchema = {
        email: data.email,
        password: data.password,
      };

      // Call context login method which updates auth state
      await login(loginPayload);
      
      // Show success message (redirect will happen via useEffect)
      showToast("Logged in successfully!", "success");
    } catch (error: any) {
      // Handle error
      const errorMessage = error?.message || "Login failed. Please try again.";
      showToast(errorMessage, "error");
      console.error("Login error:", error);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLocalLoading(true);
    try {
      // Transform RegisterFormData to UserCreateSchema
      const signupPayload: UserCreateSchema = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };

      // Call context signup method which updates auth state
      await signup(signupPayload);

      showToast("Account created successfully! Please log in.", "success");
      
      // Switch to login form
      setTimeout(() => {
        setIsLogin(true);
      }, 1000);
    } catch (error: any) {
      // Handle error
      const errorMessage = error?.message || "Registration failed. Please try again.";
      showToast(errorMessage, "error");
      console.error("Registration error:", error);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const featureCards = [
    {
      icon: <Newspaper className="h-5 w-5 text-white" />,
      title: "Curated Intelligence",
      desc: "AI-filtered insights from 10+ premium sources",
      color: "from-blue-500 to-blue-600",
      border: "hover:border-blue-400/30",
    },
    {
      icon: <Zap className="h-5 w-5 text-white" />,
      title: "Lightning Fast Updates",
      desc: "Real-time monitoring of emerging AI trends",
      color: "from-indigo-500 to-indigo-600",
      border: "hover:border-indigo-400/30",
    },
    {
      icon: <Shield className="h-5 w-5 text-white" />,
      title: "Smart Personalization",
      desc: "ML-powered feed tailored to your interests",
      color: "from-purple-500 to-purple-600",
      border: "hover:border-purple-400/30",
    },
  ];

  const stats = [
    { value: "10+", label: "Trusted News Sources" },
    { value: "10+", label: "AI Features" },
    { value: "24/7", label: "Live Coverage" },
  ];

  const isLoading = isLocalLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {isLoading && (
        <FullScreenLoader message={isLogin ? "Signing in..." : "Creating account..."} />
      )}

      <div className="w-full max-w-6xl bg-white/70 backdrop-blur-2xl shadow-2xl rounded-3xl grid lg:grid-cols-2 overflow-hidden border border-white/40">
        {/* Left Branding */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">AI News Verse</span>
            </div>

            <div className="mb-6">
              <h1 className="text-4xl font-bold text-white leading-tight mb-1">Stay ahead with</h1>
              <h2 className="text-4xl font-bold bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                AI-powered insights
              </h2>
            </div>
            <p className="text-sm text-slate-300 mb-8 max-w-md">
              Your personalized command center for AI news. Intelligent curation, real-time alerts, and insights that matter.
            </p>

            <div className="space-y-3">
              {featureCards.map((card) => (
                <div key={card.title} className={`group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all duration-300 ${card.border}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`bg-linear-to-br ${card.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-0.5">{card.title}</h3>
                      <p className="text-xs text-slate-400">{card.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="flex items-center justify-center p-6 lg:p-10 bg-white/80">
          <Card className="w-full max-w-md shadow-xl border border-slate-200/60 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-center lg:hidden mb-4">
                <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900 ml-2">AI News Hub</span>
              </div>
              <CardTitle className="text-center lg:text-left">
                {isLogin ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription className="text-center lg:text-left">
                {isLogin
                  ? "Access your personalized AI news dashboard"
                  : "Start receiving daily AI-powered insights"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLogin ? (
                <LoginForm
                  onSubmit={handleLogin}
                  onSwitchToRegister={() => setIsLogin(false)}
                  isLoading={isLoading}
                />
              ) : (
                <RegisterForm
                  onSubmit={handleRegister}
                  onSwitchToLogin={() => setIsLogin(true)}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;