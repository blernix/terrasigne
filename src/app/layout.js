import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientOnlyParallaxProvider from '@/components/ClientOnlyParallaxProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Terrasigne",
  description: "Accompagnement bien-être et développement personnel.",
  openGraph: {
    title: "Terrasigne",
    description: "Explore ton équilibre intérieur.",
    type: "website",
    images: ["/images/logoterra.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrasigne",
    description: "Accompagnement bien-être et développement personnel.",
    images: ["/images/logoterra.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientOnlyParallaxProvider>
          {children}
        </ClientOnlyParallaxProvider>
      </body>
    </html>
  );
}