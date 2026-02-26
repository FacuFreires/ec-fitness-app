import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'EC Fitness | Gestión de Rutinas',
  description: 'App de gestión de rutinas y alumnos para gimnasio',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'EC Fitness' },
};

export const viewport: Viewport = {
  themeColor: '#05ff7a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#18181f',
                color: '#f0f0ff',
                border: '1px solid #2a2a35',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#05ff7a', secondary: '#000' } },
              error: { iconTheme: { primary: '#ff3b5c', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
