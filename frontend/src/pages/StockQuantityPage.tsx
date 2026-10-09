import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { apiClient, fetchWithFallback, getStoredData, setStoredData } from '../services/api';

export interface MedicineStockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minReorderLevel: number;
  unitPrice: number;
  location: string;
  lastUpdated: string;
}

export const StockQuantityPage: React.FC = () => {
  const [stockItems, setStockItems] = useState<MedicineStockItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Quantity State
  const [editingItem, setEditingItem] = useState<MedicineStockItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  // Add Item State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Antibiotic');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('tablets');
  const [minReorderLevel, setMinReorderLevel] = useState(25);
  const [unitPrice, setUnitPrice] = useState(12.5);
  const [location, setLocation] = useState('Pharmacy Bay A-1');

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    setLoading(true);

    const data = await fetchWithFallback<MedicineStockItem[]>(
      () => apiClient.get('/pharmacy/stock'),
      () => {
        return getStoredData<MedicineStockItem[]>('pharmacy_stock_inventory', [
          { id: 'stk-1', name: 'Lisinopril 10mg', category: 'Cardiovascular', quantity: 150, unit: 'tablets', minReorderLevel: 30, unitPrice: 15.0, location: 'Bay A-1', lastUpdated: new Date().toISOString() },
          { id: 'stk-2', name: 'Amoxicillin 500mg', category: 'Antibiotic', quantity: 18, unit: 'capsules', minReorderLevel: 25, unitPrice: 22.0, location: 'Bay B-3', lastUpdated: new Date().toISOString() },
          { id: 'stk-3', name: 'Ibuprofen 400mg', category: 'Analgesic', quantity: 320, unit: 'tablets', minReorderLevel: 50, unitPrice: 8.5, location: 'Bay A-4', lastUpdated: new Date().toISOString() },
          { id: 'stk-4', name: 'Metformin 850mg', category: 'Antidiabetic', quantity: 12, unit: 'tablets', minReorderLevel: 20, unitPrice: 18.0, location: 'Bay C-2', lastUpdated: new Date().toISOString() },
          { id: 'stk-5', name: 'Omeprazole 20mg', category: 'Gastroenterology', quantity: 95, unit: 'capsules', minReorderLevel: 30, unitPrice: 14.0, location: 'Bay B-1', lastUpdated: new Date().toISOString() },
        ]);
      }
    );

    setStockItems(data);
    setLoading(false);
  };

  const handleUpdateQuantity = async (item: MedicineStockItem) => {
    try {
      await apiClient.patch(`/pharmacy/stock/${item.id}`, { quantity: newQuantity });
    } catch (e) {
      console.warn('Stock patch error, using local fallback', e);
    }

    const updated = stockItems.map((stk) => {
      if (stk.id === item.id) {
        return {
          ...stk,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
        };
      }
      return stk;
    });

    setStoredData('pharmacy_stock_inventory', updated);
    setStockItems(updated);
    setEditingItem(null);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      category,
      quantity,
      unit,
      minReorderLevel,
      unitPrice,
      location,
    };

    let newItem: MedicineStockItem = {
      ...payload,
      id: 'stk-' + Math.random().toString(36).substring(2, 7),
      lastUpdated: new Date().toISOString(),
    };

    try {
      const res = await apiClient.post('/pharmacy/stock', payload);
      if (res.data?.data) {
        newItem = res.data.data;
      }
    } catch (err) {
      console.warn('Stock add error, using local fallback', err);
    }

    const updated = [newItem, ...stockItems];
    setStoredData('pharmacy_stock_inventory', updated);
    setStockItems(updated);
    setShowAddModal(false);
    setName('');
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory ? item.category === filterCategory : true;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = stockItems.filter((i) => i.quantity <= i.minReorderLevel).length;

  const columns: Column<MedicineStockItem>[] = [
    {
      header: 'Medicine Name',
      accessor: (item) => (
        <div>
          <span className="font-bold text-mineral-900 block">{item.name}</span>
          <span className="text-[11px] text-mineral-500">Location: {item.location}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (item) => <span className="bg-surface border border-mineral-100 text-mineral-700 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">{item.category}</span>,
    },
    {
      header: 'Stock Quantity',
      accessor: (item) => {
        const isLow = item.quantity <= item.minReorderLevel;
        return (
          <div className="flex items-center gap-2">
            <span className={`text-base font-black ${isLow ? 'text-red-600' : 'text-sage-700'}`}>
              {item.quantity}
            </span>
            <span className="text-xs text-mineral-500">{item.unit}</span>
            {isLow && (
              <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                ⚠️ Low Stock Alert
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Reorder Level',
      accessor: (item) => <span className="text-xs text-mineral-500 font-medium">{item.minReorderLevel} {item.unit}</span>,
    },
    {
      header: 'Unit Price',
      accessor: (item) => <span className="font-mono font-bold text-mineral-700">${item.unitPrice.toFixed(2)}</span>,
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <button
          className="px-3 py-1.5 text-xs font-semibold text-mineral-600 bg-white border border-mineral-200 rounded-lg hover:bg-mineral-50 transition-colors shadow-sm"
          onClick={() => {
            setEditingItem(item);
            setNewQuantity(item.quantity);
          }}
        >
          ✏️ Edit Quantity
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-mineral-900 text-white p-10 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-xs font-semibold text-sage-300 uppercase tracking-widest block mb-2">
            Pharmacy & Medical Inventory
          </span>
          <h1 className="font-heading text-4xl font-black tracking-tight">Medicine Stock Management</h1>
          <p className="text-sm text-mineral-300 mt-2 font-light">Monitor real-time inventory counts and track low stock reorder alerts.</p>
        </div>

        <div className="flex gap-4">
          <button 
            className="px-6 py-2.5 rounded-xl bg-sage-500 hover:bg-sage-400 text-white font-bold tracking-wide transition-all shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            + Add Stock Item
          </button>
          <button 
            className="px-6 py-2.5 rounded-xl bg-mineral-800 hover:bg-mineral-700 text-white border border-mineral-700 font-semibold tracking-wide transition-all shadow-sm"
            onClick={() => window.print()}
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-mineral-100 shadow-glass text-center">
          <span className="text-xs text-mineral-500 font-semibold uppercase tracking-wider block mb-2">Total Stock Items</span>
          <span className="font-heading text-4xl font-black text-mineral-900">{stockItems.length}</span>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-mineral-100 shadow-glass text-center">
          <span className="text-xs text-mineral-500 font-semibold uppercase tracking-wider block mb-2">Low Stock Reorder Alerts</span>
          <span className={`font-heading text-4xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-sage-600'}`}>
            {lowStockCount}
          </span>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-mineral-100 shadow-glass text-center">
          <span className="text-xs text-mineral-500 font-semibold uppercase tracking-wider block mb-2">Inventory Valuation</span>
          <span className="font-heading text-4xl font-black text-clay-700">
            ${stockItems.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-8 rounded-3xl border border-mineral-100 shadow-glass grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputField
          label="Search Medicine Name / Category"
          placeholder="e.g. Lisinopril, Antibiotic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          label="Filter by Category"
          placeholder="-- All Categories --"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={[
            { value: 'Cardiovascular', label: 'Cardiovascular' },
            { value: 'Antibiotic', label: 'Antibiotics' },
            { value: 'Analgesic', label: 'Analgesics / Pain Relief' },
            { value: 'Antidiabetic', label: 'Antidiabetic' },
            { value: 'Gastroenterology', label: 'Gastroenterology' },
          ]}
        />
      </div>

      {/* Stock Table */}
      <DataTable columns={columns} data={filteredItems} keyExtractor={(i) => i.id} isLoading={loading} />

      {/* Edit Quantity Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-mineral-100 space-y-6">
            <h3 className="font-heading text-2xl font-bold text-mineral-900">Update Stock Quantity</h3>
            <p className="text-sm text-mineral-500">Updating inventory count for <strong className="text-mineral-900">{editingItem.name}</strong></p>

            <InputField
              label={`Quantity (${editingItem.unit})`}
              type="number"
              min={0}
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
            />

            <div className="flex gap-3 justify-end pt-4">
              <button 
                className="px-5 py-2.5 rounded-xl border border-mineral-200 text-mineral-700 font-medium hover:bg-mineral-50"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2.5 rounded-xl bg-mineral-900 text-white font-medium hover:bg-mineral-800"
                onClick={() => handleUpdateQuantity(editingItem)}
              >
                Save Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddItem} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 border border-mineral-100">
            <h3 className="font-heading text-2xl font-bold text-mineral-900">Add Stock Item</h3>
            <InputField label="Medicine Name" placeholder="e.g. Atorvastatin 20mg" required value={name} onChange={(e) => setName(e.target.value)} />
            <SelectField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Cardiovascular', label: 'Cardiovascular' },
                { value: 'Antibiotic', label: 'Antibiotic' },
                { value: 'Analgesic', label: 'Analgesic' },
                { value: 'Antidiabetic', label: 'Antidiabetic' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Stock Quantity" type="number" required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              <InputField label="Unit" placeholder="tablets" required value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Min Reorder Level" type="number" required value={minReorderLevel} onChange={(e) => setMinReorderLevel(Number(e.target.value))} />
              <InputField label="Unit Price ($)" type="number" step="0.01" required value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-xl border border-mineral-200 text-mineral-700 font-medium hover:bg-mineral-50"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 rounded-xl bg-mineral-900 text-white font-medium hover:bg-mineral-800"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
