const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  address: string;
  birthdate: string;
  sex: string;
  vendorTypes: string[];
  album?: Album;
  services?: Services;
  product?: Product;
  proposal?: Proposal;
}

export interface Album {
  name: string;
  profilePic?: string;
  whatsappNo: string;
  slipPhoto?: string;
}

export interface Services {
  whatsappNo: string;
  profilePic?: string;
  slipPhoto?: string;
  selectedServices: string[];
}

export interface Product {
  companyName: string;
  logoPic?: string;
  description: string;
  whatsappNo: string;
  slipPhoto?: string;
}

export interface Proposal {
  name: string;
  profilePic?: string;
  whatsappNo: string;
  slipPhoto?: string;
}

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API Error');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: RegisterData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  vendorLogin: (credentials: LoginCredentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};
