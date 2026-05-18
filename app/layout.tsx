// @ts-ignore: allow side-effect import of CSS without type declarations
import './globals.css';
import type { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
// @ts-ignore: allow side-effect import of CSS without type declarations
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>

        {children}

        {/* Toast notifications container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />

      </body>
    </html>
  );
}