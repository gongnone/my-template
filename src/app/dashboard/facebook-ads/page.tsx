import { useProducts } from '@/lib/contexts/ProductContext';
import { useTheme } from '@/lib/contexts/ThemeContext';

export default function FacebookAdsPage() {
  const { products } = useProducts();
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Facebook Ad Generator</h1>
        <p className="theme-text-secondary text-lg">Generate tailored Facebook ad copy and captivating headlines.</p>
      </div>

      <div className="theme-card rounded-xl p-8">
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="text-4xl">📦</span>
            <h2 className="text-2xl font-semibold theme-text-primary mt-4">Select a Product</h2>
            <p className="theme-text-secondary mt-2">
              Choose a product from your catalog or create a new one to generate Facebook ads
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {products.length === 0 ? (
              <div className="theme-card-secondary p-6 rounded-lg">
                <p className="theme-text-secondary mb-4">No products available</p>
                <button 
                  className="theme-button-primary px-6 py-2 rounded-lg"
                  onClick={() => {/* Add create product handler */}}
                >
                  Create Your First Product
                </button>
              </div>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  className="w-full theme-card-secondary hover:theme-card-hover p-6 rounded-lg text-left transition-all duration-200"
                  onClick={() => {/* Add product selection handler */}}
                >
                  <h3 className="theme-text-primary text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="theme-text-secondary line-clamp-2">{product.description}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 