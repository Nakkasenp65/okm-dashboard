import { Outfit } from "next/font/google";
import "./globals.css";

import { AppProviders } from "../components/providers/Providers";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
