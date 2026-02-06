'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [sex, setSex] = useState('');

  // Step 2: Vendor Types
  const [vendorTypes, setVendorTypes] = useState<string[]>([]);

  // Step 3: Vendor specific data
  const [albumData, setAlbumData] = useState({
    name: '',
    whatsappNo: '',
  });

  const [servicesData, setServicesData] = useState({
    whatsappNo: '',
    selectedServices: ['photography', 'videography', 'decoration'],
  });

  const [productData, setProductData] = useState({
    companyName: '',
    description: '',
    whatsappNo: '',
  });

  const [proposalData, setProposalData] = useState({
    name: '',
    whatsappNo: '',
  });

  const handleVendorTypeToggle = (type: string) => {
    setVendorTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password || !address || !birthdate || !sex) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (vendorTypes.length === 0) {
      setError('Select at least one vendor type');
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerData: any = {
        email,
        username,
        password,
        address,
        birthdate,
        sex,
        vendorTypes,
      };

      if (vendorTypes.includes('album')) {
        registerData.album = albumData;
      }
      if (vendorTypes.includes('services')) {
        registerData.services = servicesData;
      }
      if (vendorTypes.includes('product')) {
        registerData.product = productData;
      }
      if (vendorTypes.includes('proposal')) {
        registerData.proposal = proposalData;
      }

      const response = await authAPI.register(registerData);

      if (response.vendorId) {
        // Show success message and redirect to login
        alert('Registration successful! Please wait for admin approval.');
        router.push('/admin/login');
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800">CoupleCanvas</h1>
          <p className="text-center text-gray-600 mt-2">Vendor Registration - Step {step}/3</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 chars)"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Birthdate</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition"
            >
              Next
            </button>
          </form>
        )}

        {/* Step 2: Select Vendor Types */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">Select the services you offer:</p>

            <div className="space-y-2">
              {[
                { id: 'album', label: 'Wedding Album' },
                { id: 'services', label: 'Photography/Videography Services' },
                { id: 'product', label: 'Products (Gifts, Supplies)' },
                { id: 'proposal', label: 'Proposal Planning' },
              ].map((type) => (
                <label key={type.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-pink-50">
                  <input
                    type="checkbox"
                    checked={vendorTypes.includes(type.id)}
                    onChange={() => handleVendorTypeToggle(type.id)}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-2"
                  />
                  <span className="ml-3 text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Vendor Specific Information */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            {vendorTypes.includes('album') && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Wedding Album Details</h3>
                <input
                  type="text"
                  placeholder="Album business name"
                  value={albumData.name}
                  onChange={(e) => setAlbumData({ ...albumData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none mb-2"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={albumData.whatsappNo}
                  onChange={(e) => setAlbumData({ ...albumData, whatsappNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            )}

            {vendorTypes.includes('services') && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Services Details</h3>
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={servicesData.whatsappNo}
                  onChange={(e) => setServicesData({ ...servicesData, whatsappNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            )}

            {vendorTypes.includes('product') && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Product Details</h3>
                <input
                  type="text"
                  placeholder="Company name"
                  value={productData.companyName}
                  onChange={(e) => setProductData({ ...productData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none mb-2"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none mb-2"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={productData.whatsappNo}
                  onChange={(e) => setProductData({ ...productData, whatsappNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            )}

            {vendorTypes.includes('proposal') && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Proposal Planning Details</h3>
                <input
                  type="text"
                  placeholder="Business name"
                  value={proposalData.name}
                  onChange={(e) => setProposalData({ ...proposalData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none mb-2"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={proposalData.whatsappNo}
                  onChange={(e) => setProposalData({ ...proposalData, whatsappNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 rounded-lg hover:from-pink-600 hover:to-rose-600 transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/admin/login" className="text-pink-600 hover:text-pink-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
