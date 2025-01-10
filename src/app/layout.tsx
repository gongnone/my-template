import "./globals.css";
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ProductProvider } from '@/lib/contexts/ProductContext';
import { AdTemplatesProvider } from '@/lib/contexts/AdTemplatesContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AdTemplatesProvider>
          <AuthProvider>
            <ProductProvider>
              {children}
            </ProductProvider>
          </AuthProvider>
        </AdTemplatesProvider>
      </body>
    </html>
  );
}
