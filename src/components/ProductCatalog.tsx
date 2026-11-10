import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { CATEGORIES } from '../data/initialProducts';
import { ProductCard } from './ProductCard';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ProductCatalogProps {
  onQuickView: (product: Product) => void;
  onNavigateToAdmin: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onQuickView
}) => {
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceBracket, setPriceBracket] = useState<'all' | 'under50' | '50to150' | '150to500' | 'over500'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'popular'>('featured');
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(24);
  const [currentPage, setCurrentPage] = useState(1);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: { [cat: string]: number } = { All: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered & sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search query
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q));

        // Category
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

        // Stock
        const matchesStock = !inStockOnly || p.stock > 0;

        // Price bracket
        let matchesPrice = true;
        if (priceBracket === 'under50') matchesPrice = p.price < 50;
        else if (priceBracket === '50to150') matchesPrice = p.price >= 50 && p.price <= 150;
        else if (priceBracket === '150to500') matchesPrice = p.price > 150 && p.price <= 500;
        else if (priceBracket === 'over500') matchesPrice = p.price > 500;

        return matchesSearch && matchesCategory && matchesStock && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'popular') return (b.salesCount || 0) - (a.salesCount || 0);
        // Featured
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, inStockOnly, priceBracket, sortBy]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const pageSize = itemsPerPage === 'all' ? totalItems : itemsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalItems / (pageSize || 1)));
  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === 'all') return filteredProducts;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceBracket('all');
    setInStockOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Products
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Explore consumer electronics, audio gear, apparel, workspace tools, and wellness items.
        </p>
      </div>

      {/* Filter and Search Navigation Bar */}
      <div className="space-y-4">
        {/* Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
          {CATEGORIES.map(category => {
            const count = categoryCounts[category] || 0;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg shrink-0 transition-all flex items-center gap-1.5 ${isSelected ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-xs' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}
              >
                <span>{category}</span>
                <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'text-stone-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Price Bracket, and Sort Controls */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by name, brand, SKU..."
                className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="md:col-span-4 flex items-center gap-1 overflow-x-auto text-xs">
              <span className="text-stone-400 text-xs shrink-0 mr-1">Price:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'under50', label: '<$50' },
                { id: '50to150', label: '$50-$150' },
                { id: '150to500', label: '$150-$500' },
                { id: 'over500', label: '$500+' }
              ].map(bracket => (
                <button
                  key={bracket.id}
                  onClick={() => {
                    setPriceBracket(bracket.id as any);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md shrink-0 transition text-[11px] ${priceBracket === bracket.id ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}`}
                >
                  {bracket.label}
                </button>
              ))}
            </div>

            {/* In stock and Sort */}
            <div className="md:col-span-3 flex items-center justify-end gap-3">
              <label className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-3.5 h-3.5 rounded text-stone-900 focus:ring-stone-500"
                />
                <span className="text-[11px]">In Stock Only</span>
              </label>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="py-1.5 px-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Best Selling</option>
              </select>
            </div>
          </div>

          {/* Clean status bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800 gap-2">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-stone-800 dark:text-stone-200">{paginatedProducts.length}</strong> of{' '}
                <strong className="text-stone-800 dark:text-stone-200">{totalItems}</strong> products
              </span>

              {(searchQuery || selectedCategory !== 'All' || priceBracket !== 'all' || inStockOnly) && (
                <button
                  onClick={handleResetFilters}
                  className="text-stone-800 dark:text-stone-200 font-semibold underline text-xs"
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* Items Per Page Picker */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-400">View:</span>
              {[24, 48, 'all'].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setItemsPerPage(size as any);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-xs transition ${itemsPerPage === size ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              No matching products
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search or filter keywords.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {itemsPerPage !== 'all' && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-6">
          <div className="text-xs text-stone-500">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition ${currentPage === page ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold' : 'text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
