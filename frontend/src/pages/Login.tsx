import { useState } from "react";
import { Eye, ArrowRight } from "lucide-react";
import { INITIAL_USERS } from "../data/mockData";
import { setSession } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";
import { Carousel } from "../components/ui/Carousel";

const CAROUSEL_IMAGES = [
  "https://www.kodingcaravan.com/flyers/img01.webp",
  "https://www.kodingcaravan.com/flyers/img2.webp",
  "https://www.kodingcaravan.com/flyers/img3.webp",
];

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("state.admin@kodingc.com");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = INITIAL_USERS.find((u) => u.email === email) as
      | User
      | undefined;
    if (!user) {
      setError("Invalid email address");
      return;
    }
    if (user.password !== password) {
      setError("Invalid password");
      return;
    }
    setSession(user);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[var(--color-primary)] relative">
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
          className={`absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/80 to-[var(--color-info)]/80 z-10 mix-blend-multiply`}
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
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-24 flex flex-col justify-center bg-[var(--color-primary)] relative z-20">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-4xl font-bold text-white mb-3">Welcome back</h2>
          <p className="text-slate-200/70 text-base mb-10">
            Please enter your details to sign in.
          </p>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/20 text-white text-sm rounded-xl font-bold">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white transition text-white placeholder-slate-400 text-base font-medium"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white transition text-white placeholder-slate-400 text-base font-medium"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-white/10 border-white/20 text-[var(--color-primary)] focus:ring-0 w-4 h-4"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-white hover:underline font-bold">
                Forgot password?
              </a>
            </div>
            <button className="w-full py-4 bg-white hover:bg-white/90 text-[var(--color-primary)] font-bold rounded-xl transition shadow-lg shadow-black/5 flex items-center justify-center gap-2 group text-lg mt-4">
              Sign in{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>
          <p className="mt-10 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <span className="text-white font-bold cursor-pointer hover:underline">
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
            className="text-[10px] bg-white/10 border border-white/10 hover:bg-white hover:text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-white transition font-medium whitespace-nowrap"
          >
            {u.role}
          </button>
        ))}
      </div>
    </div>
  );
};
