import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GlowUp - Your AI Study Companion",
    template: "%s | GlowUp",
  },
  description: "Study smarter without stress. GlowUp is your cozy AI-powered study buddy with Lumi the Bunny, designed to help students prevent burnout and achieve their goals with gentle support.",
  keywords: ["study app", "AI companion", "study buddy", "anti-burnout", "student productivity", "GlowUp", "Lumi", "study planner", "mental health", "student wellness"],
  authors: [{ name: "GlowUp Team" }],
  creator: "GlowUp Team",
  publisher: "GlowUp",
  applicationName: "GlowUp",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon-192.png", color: "#FFD6E0" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://glowup.app",
    siteName: "GlowUp",
    title: "GlowUp - Your AI Study Companion",
    description: "Study smarter without stress with Lumi the Bunny, your cozy AI-powered study buddy designed to help students prevent burnout.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GlowUp - Study smarter with Lumi the Bunny",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GlowUp - Your AI Study Companion",
    description: "Study smarter without stress with Lumi the Bunny",
    images: ["/og-image.png"],
    creator: "@glowupapp",
  },
  appleWebApp: {
    capable: true,
    title: "GlowUp",
    statusBarStyle: "default",
    startupImage: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  formatDetection: {
    telephone: false,
    date: true,
    address: true,
    email: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "GlowUp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFD6E0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#FFD6E0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GlowUp" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration);
                    },
                    function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
