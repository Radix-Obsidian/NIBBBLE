'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart as ShoppingCartIcon, 
  Plus, 
  Minus, 
  Trash2, 
  Store, 
  Clock, 
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { ShoppingCartService, CartWithItems, CartItem } from '@/lib/services/shopping-cart-service'
import { useAuth } from '@/hooks/useAuth'

interface ShoppingCartProps {
  isOpen?: boolean
  onClose?: () => void
  onCheckout?: () => void
}

export default function ShoppingCart({ isOpen = true, onClose, onCheckout }: ShoppingCartProps) {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartWithItems | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchCart()
    }
  }, [user?.id])

  const fetchCart = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const cartData = await ShoppingCartService.getActiveCart(user.id)
      setCart(cartData)
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast({
        title: "Error",
        description: "Failed to load shopping cart",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setUpdating(itemId)
    try {
      const result = await ShoppingCartService.updateCartItemQuantity(itemId, newQuantity)
      
      if (result.success) {
        await fetchCart() // Refresh cart data
        toast({
          title: "Updated",
          description: "Item quantity updated"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update item",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive"
      })
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const result = await ShoppingCartService.removeCartItem(itemId)
      
      if (result.success) {
        await fetchCart()
        toast({
          title: "Removed",
          description: "Item removed from cart"
        })
      } else {
        toast({
          title: "Error", 
          description: result.error || "Failed to remove item",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout()
    } else {
      toast({
        title: "Checkout",
        description: "Checkout functionality coming soon!"
      })
    }
  }

  // Modal/Sidebar version
  if (isOpen !== undefined && !isOpen) return null

  const CartContent = () => (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF375F] mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading cart...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!cart || cart.cart_items.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2 text-gray-800">Your cart is empty</h3>
          <p className="text-sm text-center mb-4">
            Add items from recipes or search for products to get started
          </p>
        </div>
      )}

      {/* Cart Items */}
      {!loading && cart && cart.cart_items.length > 0 && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCartIcon className="w-6 h-6 text-[#FF375F]" />
              Shopping Cart
              <span className="bg-[#FF375F] text-white text-sm px-2 py-1 rounded-full">
                {cart.items_count}
              </span>
            </h2>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {cart.cart_items.map((item) => (
              <CartItemComponent
                key={item.id}
                item={item}
                updating={updating === item.id}
                onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items_count} items)</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${cart.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>
                    {cart.delivery_fee === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      `$${cart.delivery_fee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-[#FF375F]">${cart.estimated_total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Estimated delivery: 2-4 hours</span>
              </div>

              {/* Free Delivery Threshold */}
              {cart.delivery_fee > 0 && cart.subtotal < 35 && (
                <div className="text-sm text-amber-700 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">Almost free delivery!</span>
                  </div>
                  <span>Add ${(35 - cart.subtotal).toFixed(2)} more for free delivery</span>
                </div>
              )}

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                className="w-full bg-[#FF375F] text-white py-4 rounded-lg font-semibold hover:bg-[#E62E54] transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <CheckCircle2 className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )

  // If it's a modal/sidebar with isOpen prop
  if (isOpen !== undefined) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 bg-white">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <CartContent />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Regular page component
  return (
    <div className="max-w-4xl mx-auto">
      <CartContent />
    </div>
  )
}

// Separate component for cart items to improve performance
interface CartItemProps {
  item: CartItem
  updating: boolean
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

function CartItemComponent({ item, updating, onUpdateQuantity, onRemove }: CartItemProps) {
  // Get item name from enhanced data or fallback to product_id
  const itemName = item.enhanced_data?.name || `Product ${item.product_id}`
  const itemBrand = item.enhanced_data?.brand
  
  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
      {/* Product Image */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
        <Store className="w-8 h-8 text-gray-400" />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-base mb-1">
          {itemBrand && (
            <span className="text-gray-500 text-sm">{itemBrand} </span>
          )}
          <span className="text-gray-900">{itemName}</span>
        </h3>
        
        {/* Product Badges */}
        {item.enhanced_data?.health && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.enhanced_data.health.healthLabels?.includes('Organic') && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Organic
              </span>
            )}
            {item.enhanced_data.health.healthLabels?.includes('Gluten-Free') && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                GF
              </span>
            )}
            {item.enhanced_data.health.healthLabels?.includes('Vegan') && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                Vegan
              </span>
            )}
          </div>
        )}

        {/* Priority Indicator */}
        {item.priority === 1 && (
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Essential</span>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <p className="text-sm text-gray-600 italic mb-2">
            "{item.notes}"
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-semibold text-gray-900">
            ${item.total_price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            (${item.unit_price.toFixed(2)} per {item.unit})
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className="min-w-[2rem] text-center text-base font-medium">
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                item.quantity
              )}
            </span>
            
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={updating}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm text-gray-500">{item.unit}</span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        disabled={updating}
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        aria-label="Remove item"
      >
        {updating ? (
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}