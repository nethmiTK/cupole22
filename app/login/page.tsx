"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    if (username === "1234" && password === "1234") {
      localStorage.setItem('adminToken', 'demo-token');
      localStorage.setItem('adminData', JSON.stringify({ name: 'Admin' }));
      alert("Login Success");
      router.push("/admin/dashboard");
    } else {
      alert("Wrong Username or Password");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button style={{ width: "100%", padding: "10px" }}>
          Login
        </button>
      </form>
    </div>
  );
}
