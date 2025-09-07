'use client';

import { useState, useEffect } from 'react';
import { 
  Package,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Clock,
  MapPin,
  Search,
  Filter,
  Calendar,
  Bell,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { CommerceService, InventoryItem } from '@/lib/services/commerce-service';

interface InventoryAlert {
  id: string;
  alert_type: string;
  message: string;
  created_at: string;
  user_inventory?: {
    custom_item_name?: string;
    quantity: number;
    products?: {
      name: string;
      brand?: string;
    };
  };
}

interface InventoryDashboardProps {
  userId: string;
}

export function InventoryDashboard({ userId }: InventoryDashboardProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'each',
    location: 'pantry',
    expiryDate: ''
  });

  useEffect(() => {
    loadInventoryData();
  }, [userId]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [inventoryData, alertsData] = await Promise.all([
        CommerceService.getUserInventory(userId),
        CommerceService.getInventoryAlerts(userId)
      ]);
      
      setInventory(inventoryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const name = item.custom_item_name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    const success = await CommerceService.updateInventoryQuantity(itemId, newQuantity);
    if (success) {
      await loadInventoryData(); // Refresh data
    }
  };

  const removeItem = async (itemId: string) => {
    const success = await CommerceService.removeInventoryItem(itemId);
    if (success) {
      await loadInventoryData();
    }
  };

  const addNewItem = async () => {
    if (!newItem.name.trim()) return;
    
    const success = await CommerceService.addInventoryItem(
      userId,
      null, // No product_id for custom items
      newItem.name,
      newItem.quantity,
      newItem.unit,
      newItem.location,
      newItem.expiryDate || undefined
    );
    
    if (success) {
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'each',
        location: 'pantry',
        expiryDate: ''
      });
      setShowAddForm(false);
      await loadInventoryData();
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    const success = await CommerceService.markAlertAsRead(alertId);
    if (success) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  const getExpiryStatus = (expiryDate: string | null): 'expired' | 'expiring' | 'fresh' => {
    if (!expiryDate) return 'fresh';
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'expired';
    if (daysDiff <= 3) return 'expiring';
    return 'fresh';
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'fridge': return '🧊';
      case 'freezer': return '❄️';
      case 'pantry': return '🏠';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF375F]"></div>
          <span className="ml-3 text-gray-600">Loading inventory...</span>
        </div>
      </div>
    );
  }

  const expiringItems = inventory.filter(item => getExpiryStatus(item.expiry_date || null) === 'expiring').length;
  const expiredItems = inventory.filter(item => getExpiryStatus(item.expiry_date || null) === 'expired').length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minimum_quantity).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-[#FF375F]" />
            <h1 className="text-2xl font-bold">Pantry Inventory</h1>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#FF375F] text-white px-4 py-2 rounded-lg hover:bg-[#E62E54] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{inventory.length}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
                <p className="text-sm text-gray-600">Low Stock</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{expiringItems}</p>
                <p className="text-sm text-gray-600">Expiring Soon</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-600">{expiredItems}</p>
                <p className="text-sm text-gray-600">Expired</p>
              </div>
              <Trash2 className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
            />
          </div>
          
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
          >
            <option value="all">All Locations</option>
            <option value="pantry">Pantry</option>
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
          </select>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF375F]" />
            Inventory Alerts
          </h2>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">{alert.message}</p>
                    <p className="text-sm text-red-600">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => markAlertAsRead(alert.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
                placeholder="e.g., Organic Bananas"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
                  min="1"
                />
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
                >
                  <option value="each">each</option>
                  <option value="lbs">lbs</option>
                  <option value="oz">oz</option>
                  <option value="cups">cups</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={newItem.location}
                onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
              >
                <option value="pantry">Pantry</option>
                <option value="fridge">Fridge</option>
                <option value="freezer">Freezer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={addNewItem}
              className="bg-[#FF375F] text-white px-4 py-2 rounded-lg hover:bg-[#E62E54] transition-colors"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Inventory ({filteredInventory.length} items)</h2>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Package className="w-12 h-12 mb-2" />
              <p>No inventory items found</p>
              <p className="text-sm">Add some items to track your pantry</p>
            </div>
          ) : (
            filteredInventory.map((item) => {
              const expiryStatus = getExpiryStatus(item.expiry_date || null);
              const isLowStock = item.quantity <= item.minimum_quantity;
              
              return (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getLocationIcon(item.location || 'pantry')}</span>
                        <h3 className="font-semibold">
                          {item.custom_item_name || 'Unnamed Item'}
                        </h3>
                        
                        {/* Status badges */}
                        {isLowStock && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                        
                        {expiryStatus === 'expired' && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            Expired
                          </span>
                        )}
                        
                        {expiryStatus === 'expiring' && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location || 'pantry'}
                        </span>
                        
                        {item.expiry_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="min-w-[4rem] text-center font-semibold">
                          {item.quantity} {item.unit}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}