import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <div className="min-h-screen">
          <nav className="bg-primary-500 text-white">
            {/* Navigation content */}
          </nav>
          
          <main className="bg-background-primary">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 