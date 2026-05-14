'use client';

import { apiFetch } from "@/lib/api";
import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
  const data: any = await apiFetch("/auth/admin/login", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
  }),
});
 
    // ✅ token check
    if (!data?.token) {
      throw new Error(data?.message || "Login failed");
    }

    // ✅ save token
    localStorage.setItem("adminToken", data.token);

    alert("Login success 🌹");

    window.location.href = "/admin/dashboard";

  } catch (err: any) {
    alert(err.message);

  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-100 px-4">

      {/* background glow */}
      <div className="absolute w-72 h-72 bg-rose-200 rounded-full blur-3xl opacity-40 top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-40 bottom-10 right-10"></div>

      {/* card */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-rose-100 shadow-xl rounded-3xl p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-rose-500">Memo Album</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back 🌹</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* EMAIL */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-rose-300" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-rose-100 focus:border-rose-300 outline-none bg-white"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-rose-300" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-rose-100 focus:border-rose-300 outline-none bg-white"
              required
            />

            {/* 👁 toggle */}
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}