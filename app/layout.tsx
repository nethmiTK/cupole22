import "./globals.css";
import type { Metadata } from 'next';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: 'CoupleCanvas Admin',
  description: 'Confidential Administration Panel',
  icons: {
    icon: [
      { url: '/logos.png' },
      { url: '/favicon.png' },
    ],
    shortcut: '/logos.png',
    apple: '/logos.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
