import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Auth = () => {
  // Use state to toggle modes instead of Route persistence for smooth animation
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const container = useRef(null);
  const overlayRef = useRef(null);

  const handleToggle = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
  };

  useGSAP(() => {
    // Smooth Slide Animation:
    // Removed viscosity/elastic effect. Standard smooth slide.

    const tl = gsap.timeline({
      defaults: {
        duration: 1.0,
        ease: "power4.inOut",
      },
    });

    if (isLogin) {
      // Login State: Overlay moves to RIGHT
      tl.to(overlayRef.current, {
        xPercent: 100,
      })
        .to(
          ".form-container-register",
          { opacity: 0, x: 50, zIndex: 0, duration: 0.5, ease: "power2.in" },
          "<"
        )
        .to(
          ".form-container-login",
          { opacity: 1, x: 0, zIndex: 5, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        );
    } else {
      // Register State: Overlay moves to LEFT
      tl.to(overlayRef.current, {
        xPercent: 0,
      })
        .to(
          ".form-container-login",
          { opacity: 0, x: -50, zIndex: 0, duration: 0.5, ease: "power2.in" },
          "<"
        )
        .to(
          ".form-container-register",
          { opacity: 1, x: 0, zIndex: 5, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        );
    }
  }, [isLogin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.msg || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.msg || "Registration failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div
        ref={container}
        className="relative w-full max-w-[1000px] h-[600px] bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/50"
      >
        {/* --- REGISTER FORM (RIGHT SIDE) --- */}
        <div className="form-container-register absolute top-0 right-0 w-1/2 h-full p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-black font-['Playfair_Display'] mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Use your email for registration
          </p>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-black text-white px-8 py-3 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
        </div>

        {/* --- LOGIN FORM (LEFT SIDE) --- */}
        <div className="form-container-login absolute top-0 left-0 w-1/2 h-full p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-black font-['Playfair_Display'] mb-2">
            Sign In
          </h2>
          <p className="text-sm text-gray-400 mb-8">Use your account</p>

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
            <a
              href="#"
              className="text-xs text-black font-bold block text-right hover:underline"
            >
              Forgot your password?
            </a>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-black text-white px-8 py-3 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
        </div>

        {/* --- SLIDING OVERLAY CONTAINER --- */}
        <div
          ref={overlayRef}
          className="absolute top-0 left-0 w-1/2 h-full z-10 overflow-hidden"
        >
          <div className="bg-black text-white w-[200%] h-full relative left-[-100%] flex">
            {/* Left Panel of Overlay (Visible in Register Mode) */}
            <div className="w-1/2 h-full flex flex-col items-center justify-center p-16 text-center bg-zinc-900 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 to-transparent opacity-40"></div>

              <div className="z-10 relative">
                <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 block">
                  Deep Presence
                </span>
                <h2 className="text-4xl font-black font-['Playfair_Display'] mb-6 leading-tight">
                  Zen Writing & The Hour View.
                </h2>
                <p className="text-gray-400 mb-10 font-['Lora'] text-lg leading-relaxed">
                  "What happens when the world disappears and only your thoughts
                  remain?"
                </p>
                <button
                  onClick={() => handleToggle(true)}
                  className="group border border-white/20 hover:border-white bg-white/5 hover:bg-white text-white hover:text-black px-10 py-3.5 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all duration-300"
                >
                  Access Your Journal
                </button>
              </div>
            </div>

            {/* Right Panel of Overlay (Visible in Login Mode) */}
            <div className="w-1/2 h-full flex flex-col items-center justify-center p-16 text-center bg-black relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-zinc-800 to-transparent opacity-40"></div>

              <div className="z-10 relative">
                <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 block">
                  The Physics of Habits
                </span>
                <h2 className="text-4xl font-black font-['Playfair_Display'] mb-6 leading-tight">
                  Mathematical Insights.
                </h2>
                <p className="text-gray-400 mb-10 font-['Lora'] text-lg leading-relaxed">
                  "We track habits using y = mx + b. Set your velocity, your
                  starting point, and your goal."
                </p>
                <button
                  onClick={() => handleToggle(false)}
                  className="group border border-white/20 hover:border-white bg-white/5 hover:bg-white text-white hover:text-black px-10 py-3.5 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all duration-300"
                >
                  Start Your Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
