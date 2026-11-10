import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { productApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { Search, ShoppingBag, Eye, Check, AlertCircle } from 'lucide-react';
import { CATEGORIES, INITIAL_PRODUCTS } from '../data/productsData';

export const ProductListPage: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productApi.getAll(selectedCategory);
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).data) && (data as any).data.length > 0) {
        setProducts((data as any).data);
      } else {
        // Fallback to local 60+ product dataset matching category
        if (selectedCategory && selectedCategory !== 'All') {
          const filtered = INITIAL_PRODUCTS.filter(
            p => p.category.toLowerCase() === selectedCategory.toLowerCase()
          );
          setProducts(filtered.length > 0 ? filtered : INITIAL_PRODUCTS);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      }
    } catch (err: any) {
      console.warn('Backend unavailable, using initial 60+ catalog display:', err);
      if (selectedCategory && selectedCategory !== 'All') {
        const filtered = INITIAL_PRODUCTS.filter(
          p => p.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        setProducts(filtered.length > 0 ? filtered : INITIAL_PRODUCTS);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1500);
    } catch (err: any) {
      alert(err.message || 'Could not add to cart');
    }
  };

  const productList = Array.isArray(products) ? products : [];
  const filteredProducts = productList.filter(product => {
    if (!product) return false;
    const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-stone-900 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 text-xs font-mono font-bold tracking-wider uppercase">
            Spring Boot 3 + Firestore Powered Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Curated Essentials for Modern Living
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Engineered with strict Spring Security 6 authentication, JWT access control, and real-time Firestore persistence.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/30 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-stone-200 rounded-2xl h-80" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-stone-200 p-8">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-bold text-stone-900">No products found</h3>
          <p className="text-xs text-stone-500">
            Try adjusting your search criteria or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isAdded = addedProductId === product.id;
            const isOutOfStock = product.stockQuantity <= 0;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    {product.category}
                  </span>
                  <button
                    onClick={() => setQuickViewProduct(product)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-stone-700 opacity-0 group-hover:opacity-100 hover:bg-white transition shadow-xs"
                    title="Quick preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-stone-900 group-hover:text-indigo-600 transition line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-black text-stone-900">
                        ${product.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {isOutOfStock ? (
                          <span className="text-rose-500 font-semibold">Out of Stock</span>
                        ) : (
                          `${product.stockQuantity} in stock`
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isOutOfStock
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-900 text-white hover:bg-indigo-600 shadow-xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-stone-100">
              <img
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {quickViewProduct.category}
              </span>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                {quickViewProduct.name}
              </h2>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {quickViewProduct.description}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <div className="text-xl font-black text-stone-900">
                ${quickViewProduct.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
