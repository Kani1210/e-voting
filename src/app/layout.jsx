import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        {/* ✅ LOAD jQuery FIRST */}
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />

        {/* ✅ LOAD SDK */}
        <Script
          src="/morfinauth.js"
          strategy="beforeInteractive"
        />

        {children}
      </body>
    </html>
  );
}