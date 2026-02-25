"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Heart } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (username === "1234" && password === "1234") {
        localStorage.setItem('adminToken', 'demo-token');
        localStorage.setItem('adminData', JSON.stringify({ name: 'Admin' }));
        router.push("/admin/dashboard");
      } else {
        alert("Wrong Username or Password");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-rose-50">
      <div className="absolute inset-0 z-0">
        <Image
          src="/wedding_login_bg_1771827151145.png"
          alt="Wedding Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-black/40" />
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
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">CoupleCanvas</h1>
            <p className="text-gray-600 text-sm font-medium">Welcome back, please sign in</p>
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none transition-all duration-300 text-gray-800 placeholder:text-gray-400 font-medium text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                Forgot password?
              </button>
            </div>

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

          <div className="mt-6 text-center relative">
            <p className="text-gray-600 text-xs font-medium">
              Don&apos;t have an account?{" "}
              <button className="text-rose-600 font-bold hover:text-rose-700 transition-colors underline decoration-rose-200 underline-offset-4 decoration-2">
                Create one
              </button>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-white/70 text-[10px] font-bold uppercase tracking-[0.3em] drop-shadow-sm">
          Powered by CoupleCanvas
        </p>
      </motion.div>
    </div>
  );
}
