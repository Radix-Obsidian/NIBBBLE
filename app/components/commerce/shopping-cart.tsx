'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Store, 
  Clock, 
  DollarSign,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  priority: number;
  products: {
    id: string;
    name: string;
    brand?: string;
    image_url?: string;
    unit_type: string;
    organic: boolean;
    gluten_free: boolean;
    vegetarian: boolean;
    vegan: boolean;
  };
}

interface ShoppingCartData {
  id: string;
  user_id: string;
  store_id?: string;
  status: string;
  estimated_total: number;
  tax_amount: number;
  delivery_fee: number;
  cart_items: CartItem[];
}

interface ShoppingCartProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingCart({ userId, isOpen, onClose }: ShoppingCartProps) {
  const [cart, setCart] = useState<ShoppingCartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchCart();
    }
  }, [isOpen, userId]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/commerce/cart?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setCart(result.cart);
      } else {
        console.error('Failed to fetch cart:', result.error);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setUpdating(itemId);
    try {
      const response = await fetch(`/api/commerce/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        // Refresh cart data
        await fetchCart();
      } else {
        console.error('Failed to update item quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`/api/commerce/cart/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCart();
      } else {
        console.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping Cart
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF375F]"></div>
              </div>
            ) : !cart || cart.cart_items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <ShoppingCart className="w-12 h-12 mb-2" />
                <p>Your cart is empty</p>
                <p className="text-sm">Add items to get started</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Cart Items */}
                {cart.cart_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.products.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.products.brand && (
                          <span className="text-gray-500">{item.products.brand} </span>
                        )}
                        {item.products.name}
                      </h3>
                      
                      {/* Product Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.products.organic && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Organic
                          </span>
                        )}
                        {item.products.gluten_free && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            GF
                          </span>
                        )}
                        {item.products.vegan && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Vegan
                          </span>
                        )}
                      </div>

                      {/* Priority Indicator */}
                      {item.priority === 1 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600">Essential</span>
                        </div>
                      )}

                      {/* Price */}
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ${item.total_price.toFixed(2)}
                        <span className="text-xs text-gray-500 font-normal ml-1">
                          (${item.unit_price.toFixed(2)} each)
                        </span>
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <span className="min-w-[2rem] text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <span className="text-xs text-gray-500">
                          {item.products.unit_type}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      {updating === item.id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Cart Summary */}
          {cart && cart.cart_items.length > 0 && (
            <div className="border-t bg-gray-50 p-4">
              {/* Order Summary */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.cart_items.length} items)</span>
                  <span>${(cart.estimated_total - cart.tax_amount - cart.delivery_fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${cart.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {cart.delivery_fee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${cart.delivery_fee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cart.estimated_total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock className="w-4 h-4" />
                <span>Estimated delivery: 2-4 hours</span>
              </div>

              {/* Free Delivery Threshold */}
              {cart.delivery_fee > 0 && (
                <div className="text-sm text-amber-600 mb-4 p-2 bg-amber-50 rounded">
                  Add ${(35 - (cart.estimated_total - cart.tax_amount - cart.delivery_fee)).toFixed(2)} more for free delivery!
                </div>
              )}

              {/* Checkout Button */}
              <button className="w-full bg-[#FF375F] text-white py-3 rounded-lg font-semibold hover:bg-[#E62E54] transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}