import "./globals.css";
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ProductProvider } from '@/lib/contexts/ProductContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
