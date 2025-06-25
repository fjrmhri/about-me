import "./globals.css";

export const metadata = {
  title: "About Me - Aruna",
  description: "Website pribadi Aruna, menampilkan profil dan data Steam.",
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