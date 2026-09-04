import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Blackout Esports — Configuraciones de jugadores pro",
  description:
    "Sensibilidad, DPI, resolución y setup de jugadores profesionales, por juego.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${mono.variable} font-sans bg-ink text-paper`}>
        <Navbar />
        {children}
        <footer className="border-t border-line px-6 py-10 text-center text-xs text-mute">
          Blackout Esports — jugadores, equipos y marcas de este sitio son ficticios.
        </footer>
      </body>
    </html>
  );
}
