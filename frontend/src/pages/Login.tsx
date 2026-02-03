import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { THEME } from "../constants/theme";
import { INITIAL_USERS } from "../data/mockData";
import { setSession } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { Carousel } from "../components/ui/Carousel";
import { api, ADMIN_API } from "../api/client";

const CAROUSEL_IMAGES = [
  "https://www.kodingcaravan.com/flyers/img01.webp",
  "https://www.kodingcaravan.com/flyers/img2.webp",
  "https://www.kodingcaravan.com/flyers/img3.webp",
];

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        data?: {
          admin: { id: string; email: string; fullName: string | null; roles?: { code: string; name?: string }[] };
          tokens: { accessToken: string; refreshToken: string };
        };
      }>(`${ADMIN_API}/auth/login`, { email: email.trim(), password });
      const data = res as { success?: boolean; data?: { admin: { id: string; email: string; fullName: string | null; roles?: { code: string; name?: string }[] }; tokens: { accessToken: string; refreshToken: string } } };
      if (data.success && data.data?.admin && data.data?.tokens) {
        const admin = data.data.admin;
        const roleName = admin.roles?.[0]?.name ?? admin.roles?.[0]?.code ?? "Admin";
        const user: User = {
          id: admin.id,
          email: admin.email,
          name: admin.fullName ?? admin.email,
          role: roleName,
          regionId: "ALL",
          avatarUrl: `https://i.pravatar.cc/150?u=${admin.email}`,
        };
        setSession(user, data.data.tokens);
        navigate("/dashboard");
        return;
      }
    } catch (err: unknown) {
      let message = "Invalid email or password";
      if (err instanceof Error && err.message) {
        try {
          const parsed = JSON.parse(err.message) as { message?: string };
          if (parsed?.message) message = parsed.message;
        } catch {
          if (err.message && !err.message.startsWith("{")) message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#4D2B8C] relative">
      {/* LEFT SIDE - IMAGE/GRADIENT */}
      <div className="md:w-1/2 relative hidden md:flex flex-col justify-between p-12 lg:p-16 text-white overflow-hidden">
        {/* CAROUSEL BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <Carousel
            images={CAROUSEL_IMAGES}
            interval={5000}
            currentIndex={currentSlide}
            onIndexChange={setCurrentSlide}
          />
        </div>

        {/* GRADIENT OVERLAYS - Adjusted to be on top of carousel but behind text */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${THEME.colors.primary.bgGradient} z-10 opacity-80 mix-blend-multiply`}
        ></div>
        <div
          className="absolute inset-0 opacity-30 z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(109, 195, 187, 0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(242, 174, 187, 0.2) 0%, transparent 25%)",
          }}
        ></div>
        <div className="relative z-20">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="KodingC Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="font-bold text-2xl tracking-wide">KodingC.</span>
          </div>
        </div>
        <div className="relative z-20">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Empowering <br />
            Education Management.
          </h2>
          <p className="text-white/70 text-lg font-medium leading-relaxed max-w-md">
            Streamline operations, track performance, and manage your
            educational hierarchy efficiently with our comprehensive dashboard.
          </p>
        </div>
        <div className="relative z-20 flex gap-3">
          {CAROUSEL_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${index === currentSlide ? "w-12 bg-white" : "w-3 bg-white/30 hover:bg-white/50"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-24 flex flex-col justify-center bg-[#4D2B8C] relative z-20">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-4xl font-bold text-white mb-3">Welcome back</h2>
          <p className="text-slate-400 text-base mb-10">
            Please enter your details to sign in.
          </p>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-[#F39EB6]/10 border border-[#F39EB6]/20 text-[#F39EB6] text-sm rounded-xl font-bold">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-[#4D2B8C]/50 border border-[#ffffff]/20 rounded-xl outline-none focus:border-[#F39EB6] transition text-white placeholder-slate-300 text-base font-medium"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 bg-[#4D2B8C]/50 border border-[#ffffff]/20 rounded-xl outline-none focus:border-[#F39EB6] transition text-white placeholder-slate-300 text-base font-medium"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-[#4D2B8C]/50 border-[#ffffff]/20 text-[#F39EB6] focus:ring-0 w-4 h-4"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-[#F39EB6] hover:underline font-bold">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#F39EB6] hover:bg-[#F39EB6]/90 disabled:opacity-70 text-white font-bold rounded-xl transition shadow-lg shadow-[#F39EB6]/30 flex items-center justify-center gap-2 group text-lg mt-4"
            >
              {loading ? "Signing in…" : "Sign in"}{" "}
              {!loading && (
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>
          </form>
          <p className="mt-10 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <span className="text-[#F39EB6] font-bold cursor-pointer hover:underline">
              Request Access
            </span>
          </p>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 md:left-auto md:right-8 flex flex-wrap justify-end gap-2 z-30 opacity-50 hover:opacity-100 transition-opacity">
        {INITIAL_USERS.map((u) => (
          <button
            key={u.email}
            onClick={() => setEmail(u.email)}
            className="text-[10px] bg-[#4D2B8C]/50 border border-[#ffffff]/20 hover:bg-[#F39EB6] px-3 py-1.5 rounded-lg text-white transition font-medium whitespace-nowrap"
          >
            {u.role}
          </button>
        ))}
      </div>
    </div>
  );
};
