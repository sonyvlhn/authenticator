import type { Metadata } from "next";
import { Outfit } from 'next/font/google';
import "./globals.css";

const outfit = Outfit({
  subsets: ['latin'],       // ← quais caracteres incluir (latin cobre pt-BR)
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit', // ← cria uma CSS custom property com esse nome
})

export const metadata: Metadata = {
  title: "Administração Ecommerce",
  description: "Este arquivo na real só um exemplo para authenticator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className={`${outfit.className} min-h-full flex flex-col`}>
        {children}</body>
    </html>
  );
}
