"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Heart, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showBgImage, setShowBgImage] = useState(true);
  const [showLogoImage, setShowLogoImage] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");

    if (token && adminData) {
      router.replace("/admin/dashboard");
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      if (username === "memo22@albumCB" && password === "cb22@memoALBUM") {
        localStorage.setItem("adminToken", "memo-admin-token");
        localStorage.setItem("adminData", JSON.stringify({
          name: "Admin",
          email: username,
        }));

        toast.success("Login successful");
        setTimeout(() => router.replace("/admin/dashboard"), 500);
      } else {
        setErrorMessage("Wrong username or password");
        setIsLoading(false);
      }
    }, 800);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-rose-50 to-white">
        <div className="w-10 h-10 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-rose-50">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,#ffe8ef_0%,#ffdce6_30%,#f9d1dd_55%,#f6c6d5_100%)]">
        {showBgImage && (
          <Image
            src="/login-bg.png"
            alt="Wedding Background"
            fill
            className="object-cover"
            priority
            onError={() => setShowBgImage(false)}
          />
        )}
        <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-black/35" />
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-30 z-1">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: "110vh",
              opacity: [0, 1, 1, 0],
              x: Math.sin(i) * 50
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
            className="absolute"
            style={{ left: `${(i + 1) * 15}%` }}
          >
            <Heart size={20} className="text-white/40 fill-white/20" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/40 p-8 md:p-10 overflow-hidden relative group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-400/20 blur-[80px] rounded-full group-hover:bg-rose-400/30 transition-colors duration-700" />

          <div className="text-center mb-6 relative">
            <div className="mx-auto mb-4 flex justify-center">
              {showLogoImage ? (
                <Image
                  src="/couplecanvas-logo.png"
                  alt="CoupleCanvas logo"
                  width={130}
                  height={130}
                  className="h-[90px] w-auto object-contain"
                  onError={() => setShowLogoImage(false)}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xl">
                  CC
                </div>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1"> Memo Album</h1>
            <p className="text-gray-600 text-sm font-medium">Welcome back admin!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-rose-500 text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all duration-300 text-gray-800 placeholder:text-gray-400 font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-rose-500 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all duration-300 text-gray-800 placeholder:text-gray-400 font-medium text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-400 hover:text-rose-500 active:text-rose-600 transition-colors bg-transparent border-0 outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="pointer-events-none">
                      {showPassword ? <EyeOff size={18} strokeWidth={2.1} /> : <Eye size={18} strokeWidth={2.1} />}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {errorMessage}
              </p>
            )}

            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all duration-300 ${isLoading
                ? "bg-rose-400 cursor-not-allowed"
                : "bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-rose-500/40"
                }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
 
        </div>

        <p className="text-center mt-6 text-white/70 text-[10px] font-bold uppercase tracking-[0.3em] drop-shadow-sm">
          Powered by code builder
        </p>
      </motion.div>
    </div>
  );
}
