const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
};

export const authHeaders = (): Record<string, string> => {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  // convert response to json
  const data = await res.json();

  // throw error if request failed
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export default API_URL;