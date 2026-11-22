import { MarketProvider } from "@/components/market/MarketProvider";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pretty Much Booked",
  description: "On-demand mobile beauty — book hair, nails, makeup, lashes & more",
  icons: {
    icon: [
      { url: "/images/logo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo-64.png", sizes: "64x64", type: "image/png" },
      { url: "/images/logo-128.png", sizes: "128x128", type: "image/png" },
    ],
    apple: [{ url: "/images/logo-256.png", sizes: "256x256", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <MarketProvider>{children}</MarketProvider>
      </body>
    </html>
  );
}
