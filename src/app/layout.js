import "./globals.css";

export const metadata = {
  title: "About Me - fjr",
  description: "Website pribadi fjr, menampilkan profil dan data Steam.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
