import './globals.css';

export const metadata = {
  title: 'Mistral Next Chat',
  description: 'Minimal chat app using Mistral API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
