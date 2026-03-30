import type { Metadata } from "next";
import "./globals.css";
import "./styles/cyberpunk.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "GAME.LIBRARY // CYBERPUNK EDITION",
  description: "Access the digital game archive. Jack in. Play. Dominate.",
  keywords: ["games", "cyberpunk", "retro-futuristic", "digital", "arcade"],
  authors: [{ name: "System Administrator" }],
  creator: "Game Library Systems",
  publisher: "Cyber Division",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cyber-black text-neon-cyan antialiased cyber-cursor">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
