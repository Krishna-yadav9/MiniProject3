import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  Star,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag
} from 'lucide-react';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose
}) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 8);
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200 relative max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur-xs text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image Column */}
        <div className="md:w-1/2 relative bg-stone-100 dark:bg-stone-800 min-h-[260px] md:min-h-full">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {discountPercent > 0 && (
              <span className="bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md">
                Save {discountPercent}%
              </span>
            )}
            <span className="bg-stone-900/90 text-white backdrop-blur-xs text-xs font-medium px-2.5 py-1 rounded shadow-md font-mono">
              SKU: {product.sku}
            </span>
          </div>

          <div className="absolute bottom-4 left-4">
            {isOutOfStock ? (
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Only {product.stock} units left!
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                In Stock ({product.stock} units)
              </span>
            )}
          </div>
        </div>

        {/* Product Info Column */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Category and Rating */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-stone-400 font-normal">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-black text-stone-900 dark:text-stone-100 leading-snug">
              {product.title}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-stone-400 line-through font-mono">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {product.description}
            </p>

            {/* Key Features Bullet List */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  Highlights:
                </span>
                <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-md capitalize"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="pt-6 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-800">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 transition font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 font-mono font-bold text-xs text-stone-900 dark:text-stone-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 transition font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${isOutOfStock ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed' : justAdded ? 'bg-emerald-600 text-white' : 'bg-stone-900 hover:bg-indigo-600 text-white'}`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart • $${(product.price * quantity).toFixed(2)}`}</span>
                  </>
                )}
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-stone-400 text-center">
              <div className="flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Fast Express</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2-Yr Warranty</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>30d Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
