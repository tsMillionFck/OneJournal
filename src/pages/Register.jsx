import React, { useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const container = useRef(null);

  useGSAP(
    () => {
      // Swap Animation: Register has Black Panel on RIGHT, Form on LEFT.
      // We animate them FROM the Login positions (Black Left, Form Right).

      // Black Panel (Right) comes from Left (-100%)
      gsap.from(".auth-panel-black", {
        xPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        clearProps: "all",
      });

      // Form Panel (Left) comes from Right (+100%)
      gsap.from(".auth-panel-white", {
        xPercent: 100,
        duration: 1.2,
        ease: "power4.inOut",
        clearProps: "all",
      });

      // Content fade in
      gsap.from(".auth-content", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: "power2.out",
      });
    },
    { scope: container }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={container}
      className="min-h-screen flex flex-col md:flex-row font-sans overflow-hidden"
    >
      {/* Left Panel - Feature Showcase */}
      <div className="auth-panel-black md:w-1/2 bg-black text-white p-12 flex flex-col justify-between relative overflow-hidden order-1 md:order-2 z-10">
        {/* Abstract Background Element */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-800 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2 filter"></div>

        <div className="z-10 flex justify-end">
          {/* Optional: Top right content for showcase */}
        </div>

        <div className="z-10 max-w-md ml-auto text-right">
          <span className="font-['Inter'] text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 block">
            Zen Mode
          </span>
          <h2 className="font-['Playfair_Display'] text-5xl font-black mb-6 leading-tight">
            Find clarity in the <span className="text-gray-500">chaos.</span>
          </h2>
          <p className="font-['Lora'] text-lg text-gray-400 leading-relaxed">
            "The scariest moment is always just before you start."
            <br />
            <span className="text-sm mt-4 block text-gray-600 not-italic font-['Inter'] uppercase tracking-wider font-bold">
              — Stephen King
            </span>
          </p>
        </div>

        <div className="z-10 flex justify-end">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-800"></div>
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-gray-800"></div>
          </div>
        </div>
      </div>

      {/* Right Panel (Left visually) - Register Form */}
      <div className="auth-panel-white md:w-1/2 bg-white p-8 md:p-16 flex items-center justify-center order-2 md:order-1 relative z-0">
        <div className="auth-content w-full max-w-md space-y-8">
          <div className="md:hidden mb-8">
            <h1 className="text-2xl font-black font-['Playfair_Display'] tracking-tight">
              One-Journal
            </h1>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-900 font-['Playfair_Display'] mb-2">
              Create an account
            </h2>
            <p className="text-gray-500">
              Start your journey of reflection today.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-black hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
