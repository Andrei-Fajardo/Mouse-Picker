import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mouse Picker",
  description: "Browse gaming mice in 3D with their brands, sensors and internals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
