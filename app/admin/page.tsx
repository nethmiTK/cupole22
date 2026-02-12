import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// Optionally, you can add authentication logic here
// For now, just show the dashboard page
export default function AdminPage() {
  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the admin dashboard. Use the sidebar to navigate.</p>
    </main>
  );
}
