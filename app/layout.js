=import "./globals.css";

export const metadata = {
  title: "Our Wedding Board",
  description: "Save wedding ideas in one place",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c4f6e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wedding Board" />
      </head>
      <body>{children}</body>
    </html>
  );
}