import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  BarChart3,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  Printer,
  Edit2,
  Trash2,
  TrendingUp,
  RefreshCw,
  FileSpreadsheet,
  Package,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  lastUpdated?: string;
}

export interface Transaction {
  id: number;
  type: 'Incoming' | 'Outgoing';
  product: string;
  productId?: number;
  qty: number;
  date: string;
  user: string;
  reference?: string;
  notes?: string;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, sku: 'AVN-SKIN-01', name: 'Anew Skin-Vincible Day Cream', category: 'Skincare', price: 650, stock: 12, minStock: 10 },
  { id: 2, sku: 'AVN-FRAG-02', name: 'Far Away Eau de Parfum', category: 'Fragrance', price: 899, stock: 4, minStock: 8 },
  { id: 3, sku: 'AVN-MKUP-03', name: 'True Color Lipstick - Ruby', category: 'Makeup', price: 350, stock: 25, minStock: 15 },
  { id: 4, sku: 'AVN-CARE-04', name: 'Care Intensive Moisture Lotion', category: 'Personal Care', price: 280, stock: 3, minStock: 10 },
  { id: 5, sku: 'AVN-MKUP-05', name: 'Mark. Gel Shine Nail Enamel', category: 'Makeup', price: 220, stock: 30, minStock: 10 },
  { id: 6, sku: 'AVN-CARE-06', name: 'Skin So Soft Original Bath Oil', category: 'Personal Care', price: 420, stock: 18, minStock: 10 },
  { id: 7, sku: 'AVN-FRAG-07', name: 'Rare Pearls Eau de Parfum', category: 'Fragrance', price: 850, stock: 6, minStock: 10 },
  { id: 8, sku: 'AVN-MKUP-08', name: 'Ultra Matte Lipstick - Marvelous Mocha', category: 'Makeup', price: 360, stock: 16, minStock: 12 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 101, type: 'Incoming', product: 'True Color Lipstick - Ruby', productId: 3, qty: 20, date: '2026-06-01', user: 'Admin', reference: 'REC-2026-001', notes: 'Central DC shipment batch #81' },
  { id: 102, type: 'Outgoing', product: 'Far Away Eau de Parfum', productId: 2, qty: 5, date: '2026-06-02', user: 'Representative A', reference: 'REP-ORD-402', notes: 'Direct campaign 11 allocation' },
  { id: 103, type: 'Incoming', product: 'Anew Skin-Vincible Day Cream', productId: 1, qty: 15, date: '2026-06-03', user: 'Warehouse Logistics', reference: 'REC-2026-002', notes: 'Replenishment intake' },
  { id: 104, type: 'Outgoing', product: 'Care Intensive Moisture Lotion', productId: 4, qty: 7, date: '2026-06-04', user: 'Representative Maria Santos', reference: 'REP-ORD-405', notes: 'Branch counter pickup' },
];

const CATEGORIES = ['All', 'Skincare', 'Fragrance', 'Makeup', 'Personal Care'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'transactions' | 'reports'>('dashboard');

  // Load from local storage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('avon_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('avon_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('avon_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('avon_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'instock' | 'out'>('all');
  const [txFilter, setTxFilter] = useState<'all' | 'Incoming' | 'Outgoing'>('all');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [prefilledProductForTrans, setPrefilledProductForTrans] = useState<string | null>(null);

  // Form States for Product
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    category: 'Skincare',
    price: '',
    stock: '',
    minStock: '10',
  });

  // Form States for Movement / Transaction
  const [transForm, setTransForm] = useState({
    type: 'Incoming' as 'Incoming' | 'Outgoing',
    product: products[0]?.name || '',
    qty: '5',
    user: 'Local Office Staff',
    reference: '',
    notes: '',
  });

  // Keep transForm product valid if products list updates
  useEffect(() => {
    if (!products.some(p => p.name === transForm.product) && products.length > 0) {
      setTransForm(prev => ({ ...prev, product: products[0].name }));
    }
  }, [products, transForm.product]);

  // Computed Dashboard Metrics
  const lowStockItems = useMemo(() => products.filter(p => p.stock <= p.minStock && p.stock > 0), [products]);
  const outOfStockItems = useMemo(() => products.filter(p => p.stock === 0), [products]);
  const criticalItems = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);
  const totalStockCount = useMemo(() => products.reduce((acc, curr) => acc + curr.stock, 0), [products]);
  const totalInventoryValue = useMemo(() => products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0), [products]);

  // Category breakdown for reporting
  const categoryStats = useMemo(() => {
    const cats: Record<string, { count: number; totalUnits: number; totalValue: number }> = {};
    products.forEach(p => {
      if (!cats[p.category]) {
        cats[p.category] = { count: 0, totalUnits: 0, totalValue: 0 };
      }
      cats[p.category].count += 1;
      cats[p.category].totalUnits += p.stock;
      cats[p.category].totalValue += (p.price * p.stock);
    });
    return Object.entries(cats).map(([name, data]) => ({ name, ...data }));
  }, [products]);

  // Product List Filtered
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesStockStatus =
        stockStatusFilter === 'all' ? true :
        stockStatusFilter === 'low' ? (p.stock <= p.minStock && p.stock > 0) :
        stockStatusFilter === 'out' ? p.stock === 0 :
        (p.stock > p.minStock);

      return matchesSearch && matchesCategory && matchesStockStatus;
    });
  }, [products, searchQuery, selectedCategory, stockStatusFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.reference && t.reference.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = txFilter === 'all' || t.type === txFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, txFilter]);

  // Open Modal Helpers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      sku: `AVN-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Skincare',
      price: '',
      stock: '',
      minStock: '10',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      minStock: prod.minStock.toString(),
    });
    setIsProductModalOpen(true);
  };

  const openStockModal = (productName?: string, type: 'Incoming' | 'Outgoing' = 'Incoming') => {
    const selectedProd = productName || products[0]?.name || '';
    setPrefilledProductForTrans(selectedProd);
    setTransForm({
      type,
      product: selectedProd,
      qty: '5',
      user: type === 'Incoming' ? 'Warehouse Logistics' : 'Representative Order',
      reference: `${type === 'Incoming' ? 'RCV' : 'REP'}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setIsTransModalOpen(true);
  };

  // Submit Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || productForm.stock === '') return;

    const parsedPrice = parseFloat(productForm.price);
    const parsedStock = parseInt(productForm.stock, 10);
    const parsedMin = parseInt(productForm.minStock, 10) || 5;

    if (isNaN(parsedPrice) || isNaN(parsedStock) || parsedPrice < 0 || parsedStock < 0) {
      alert('Please enter valid numeric values for price and stock.');
      return;
    }

    if (editingProduct) {
      // Edit existing
      setProducts(prev => prev.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            sku: productForm.sku.trim() || p.sku,
            name: productForm.name.trim(),
            category: productForm.category,
            price: parsedPrice,
            stock: parsedStock,
            minStock: parsedMin,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      }));
      showToast(`Updated "${productForm.name}" successfully.`);
    } else {
      // Add new
      const newId = Date.now();
      const newProd: Product = {
        id: newId,
        sku: productForm.sku.trim() || `AVN-${Math.floor(1000 + Math.random() * 9000)}`,
        name: productForm.name.trim(),
        category: productForm.category,
        price: parsedPrice,
        stock: parsedStock,
        minStock: parsedMin,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setProducts(prev => [newProd, ...prev]);

      // Automatically register initial incoming movement
      if (parsedStock > 0) {
        setTransactions(prev => [
          {
            id: Date.now() + 1,
            type: 'Incoming',
            product: newProd.name,
            productId: newId,
            qty: parsedStock,
            date: new Date().toISOString().split('T')[0],
            user: 'Inventory Initializer',
            reference: 'INIT-STOCK',
            notes: 'Initial inventory intake entry',
          },
          ...prev,
        ]);
      }
      showToast(`Added "${newProd.name}" to inventory.`);
    }

    setIsProductModalOpen(false);
  };

  // Delete Product
  const handleDeleteProduct = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`Deleted "${name}".`);
    }
  };

  // Submit Transaction / Stock Movement
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(transForm.qty, 10);
    if (!qtyNum || qtyNum <= 0) {
      alert('Please enter a quantity greater than zero.');
      return;
    }

    const targetProduct = products.find(p => p.name === transForm.product);
    if (!targetProduct) {
      alert('Selected product not found.');
      return;
    }

    if (transForm.type === 'Outgoing' && targetProduct.stock < qtyNum) {
      alert(`Insufficient stock! Available: ${targetProduct.stock} units. Attempted to release: ${qtyNum} units.`);
      return;
    }

    // Update Product Stock
    setProducts(prev => prev.map(p => {
      if (p.name === transForm.product) {
        const newStock = transForm.type === 'Incoming'
          ? p.stock + qtyNum
          : Math.max(0, p.stock - qtyNum);
        return {
          ...p,
          stock: newStock,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    }));

    // Add Transaction
    const newTx: Transaction = {
      id: Date.now(),
      type: transForm.type,
      product: transForm.product,
      productId: targetProduct.id,
      qty: qtyNum,
      date: new Date().toISOString().split('T')[0],
      user: transForm.user.trim() || (transForm.type === 'Incoming' ? 'Warehouse Staff' : 'Representative'),
      reference: transForm.reference.trim() || undefined,
      notes: transForm.notes.trim() || undefined,
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsTransModalOpen(false);
    showToast(`${transForm.type === 'Incoming' ? 'Received' : 'Dispatched'} ${qtyNum} units of "${transForm.product}".`);
  };

  // Quick Inline Adjustment (+1 or -1)
  const handleQuickAdjust = (prod: Product, delta: number) => {
    if (delta < 0 && prod.stock <= 0) return;
    const newStock = Math.max(0, prod.stock + delta);
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, stock: newStock } : p));

    setTransactions(prev => [
      {
        id: Date.now(),
        type: delta > 0 ? 'Incoming' : 'Outgoing',
        product: prod.name,
        productId: prod.id,
        qty: Math.abs(delta),
        date: new Date().toISOString().split('T')[0],
        user: 'Quick Adjuster',
        reference: 'MANUAL-ADJ',
        notes: `Quick count adjustment (${delta > 0 ? '+1' : '-1'})`,
      },
      ...prev,
    ]);

    showToast(`${delta > 0 ? '+1' : '-1'} unit for ${prod.name}`);
  };

  // Reset to default demo data
  const handleResetData = () => {
    if (window.confirm('Reset all inventory records and transactions back to Avon official sample dataset?')) {
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      showToast('Inventory reset to initial dataset.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['SKU,Product Name,Category,Unit Price (PHP),Current Stock,Min Threshold,Stock Status,Valuation (PHP)'];
    const rows = products.map(p => {
      const status = p.stock === 0 ? 'Out of Stock' : (p.stock <= p.minStock ? 'Low Stock' : 'Optimal');
      const val = p.price * p.stock;
      return `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}",${p.price},${p.stock},${p.minStock},"${status}",${val}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join('\n'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Avon_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inventory CSV file exported successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 text-sm border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar: Strict 3-zone Top Bar Contract */}
      <header className="bg-gradient-to-r from-pink-800 via-pink-700 to-rose-700 text-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
          {/* Zone 1: Brand title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <ShoppingBag className="h-5 w-5 text-pink-100" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight text-white whitespace-nowrap">
                AVON Inventory
              </span>
              <span className="text-[11px] text-pink-200 tracking-wider uppercase font-medium">
                Distribution Office Module
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-black/15 p-1 rounded-lg border border-white/10 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-white text-pink-800 font-semibold shadow-sm' : 'text-pink-100 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'products' ? 'bg-white text-pink-800 font-semibold shadow-sm' : 'text-pink-100 hover:bg-white/10'
              }`}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>Products & Stock</span>
              {criticalItems.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                  {criticalItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'transactions' ? 'bg-white text-pink-800 font-semibold shadow-sm' : 'text-pink-100 hover:bg-white/10'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Stock Movements</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'reports' ? 'bg-white text-pink-800 font-semibold shadow-sm' : 'text-pink-100 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Reports</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openStockModal(undefined, 'Incoming')}
              className="inline-flex items-center space-x-1.5 bg-white text-pink-700 hover:bg-pink-50 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Movement</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto border-t border-white/15 px-3 py-2 gap-2 bg-pink-800/60 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard' ? 'bg-white text-pink-800 font-semibold' : 'text-pink-100 hover:bg-white/10'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-1 ${
              activeTab === 'products' ? 'bg-white text-pink-800 font-semibold' : 'text-pink-100 hover:bg-white/10'
            }`}
          >
            <span>Products</span>
            {criticalItems.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full">
                {criticalItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'transactions' ? 'bg-white text-pink-800 font-semibold' : 'text-pink-100 hover:bg-white/10'
            }`}
          >
            Movements
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              activeTab === 'reports' ? 'bg-white text-pink-800 font-semibold' : 'text-pink-100 hover:bg-white/10'
            }`}
          >
            Reports
          </button>
        </div>
      </header>

      {/* Main Workspace Viewport */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 space-y-6">
        {/* ===================== VIEW 1: DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Operations Overview</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Avon Local Distribution Branch · Real-time stock valuation & representative movement log
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openAddProductModal}
                  className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Product</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inventory Value</span>
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    ₱{totalInventoryValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="font-medium text-slate-700 font-mono tabular-nums">{products.length}</span> active SKUs cataloged
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total On-Hand Units</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {totalStockCount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">units</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Spread across {categoryStats.length} beauty categories
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
                    {criticalItems.length}
                  </span>
                  <span className="text-xs text-slate-500">at or below minimum</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {outOfStockItems.length > 0 ? (
                    <span className="text-rose-600 font-semibold">{outOfStockItems.length} zero stock SKU(s)</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">All items have positive balance</span>
                  )}
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Movement Logs</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {transactions.length}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">logged</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                  <span className="text-emerald-700 font-medium">
                    {transactions.filter(t => t.type === 'Incoming').length} In
                  </span>
                  <span>·</span>
                  <span className="text-pink-700 font-medium">
                    {transactions.filter(t => t.type === 'Outgoing').length} Out
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Low Stock Alert Banner (if any) */}
            {criticalItems.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-amber-900">
                        {criticalItems.length} Products Require Immediate Replenishment
                      </h3>
                      <p className="text-xs text-amber-800/80 mt-0.5">
                        These beauty items are currently running at or below the branch minimum buffer threshold.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('products');
                        setStockStatusFilter('low');
                      }}
                      className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline px-2 py-1"
                    >
                      View All Low Stock
                    </button>
                    <button
                      onClick={() => openStockModal(criticalItems[0]?.name, 'Incoming')}
                      className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-xs"
                    >
                      Reorder First Item ({criticalItems[0]?.name})
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {criticalItems.slice(0, 3).map(prod => (
                    <div key={prod.id} className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-semibold text-slate-900 truncate">{prod.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {prod.category} · Stock: <span className="font-mono font-bold text-amber-700">{prod.stock}</span> / Min: {prod.minStock}
                        </div>
                      </div>
                      <button
                        onClick={() => openStockModal(prod.name, 'Incoming')}
                        className="px-2.5 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-medium shrink-0 transition-colors"
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Split Grid: Category Distribution & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Breakdown (1 col) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Inventory by Category</h3>
                  <span className="text-xs text-slate-500">{categoryStats.length} Categories</span>
                </div>
                <div className="divide-y divide-slate-100 mt-2 flex-1">
                  {categoryStats.map(cat => {
                    const percentage = totalStockCount > 0 ? Math.round((cat.totalUnits / totalStockCount) * 100) : 0;
                    return (
                      <div key={cat.name} className="py-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-800">{cat.name}</span>
                          <span className="text-slate-500 font-mono tabular-nums">
                            {cat.totalUnits} pcs ({percentage}%)
                          </span>
                        </div>
                        {/* Clean progress bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                          <span>{cat.count} items cataloged</span>
                          <span className="font-mono tabular-nums text-slate-600 font-medium">
                            ₱{cat.totalValue.toLocaleString('en-PH')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 border-t border-slate-100 text-right">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="text-xs text-pink-700 hover:text-pink-800 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View full valuation report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recent Stock Activity (2 cols) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recent Movement Ledger</h3>
                    <p className="text-xs text-slate-500">Shipments received and representative dispatches</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-pink-700 hover:text-pink-800 font-semibold"
                  >
                    View All Movements
                  </button>
                </div>

                <div className="mt-3 divide-y divide-slate-100 flex-1">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === 'Incoming'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {tx.type === 'Incoming' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{tx.product}</p>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{tx.user}</span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">{tx.date}</span>
                            {tx.reference && (
                              <>
                                <span>·</span>
                                <span className="font-mono text-slate-400">{tx.reference}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-bold text-sm ${
                            tx.type === 'Incoming' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {tx.type === 'Incoming' ? '+' : '-'}{tx.qty} units
                        </span>
                        <span className="block text-[11px] text-slate-400 uppercase tracking-wider">
                          {tx.type === 'Incoming' ? 'Shipment In' : 'Stock Out'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {transactions.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No stock movements recorded yet.
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Showing last 5 of {transactions.length} entries</span>
                  <button
                    onClick={() => openStockModal(undefined, 'Outgoing')}
                    className="text-pink-700 hover:text-pink-800 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Record representative order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 2: PRODUCTS CATALOG ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products & Stock Inventory</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage Avon product catalog, monitor buffer levels, and adjust counts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openAddProductModal}
                  className="inline-flex items-center space-x-1.5 bg-pink-700 hover:bg-pink-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Controls Bar: Search & Category Filter Segmented */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by product name, category, or SKU..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Stock Status Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto overflow-x-auto max-w-full">
                  <button
                    onClick={() => setStockStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      stockStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('low')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      stockStatusFilter === 'low' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Low Stock ({lowStockItems.length})</span>
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('out')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      stockStatusFilter === 'out' ? 'bg-white text-rose-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Out of Stock ({outOfStockItems.length})</span>
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('instock')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      stockStatusFilter === 'instock' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Healthy
                  </button>
                </div>
              </div>

              {/* Category Segmented Bar */}
              <div className="flex items-center gap-1 border-t border-slate-100 pt-3 overflow-x-auto text-xs scrollbar-none">
                <span className="text-slate-400 font-medium mr-2 shrink-0">Category:</span>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-md transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-pink-100 text-pink-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Product & Category</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4 text-right">Unit Price</th>
                      <th className="py-3 px-4 text-center">Current Stock</th>
                      <th className="py-3 px-4 text-center">Min Buffer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Valuation</th>
                      <th className="py-3 px-4 text-center">Quick Adjust</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredProducts.map(prod => {
                      const isLow = prod.stock <= prod.minStock && prod.stock > 0;
                      const isOut = prod.stock === 0;
                      const val = prod.price * prod.stock;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Name & Category */}
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            <div className="font-semibold text-slate-900">{prod.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{prod.category}</div>
                          </td>

                          {/* SKU */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {prod.sku}
                          </td>

                          {/* Unit Price */}
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            ₱{prod.price.toFixed(2)}
                          </td>

                          {/* Current Stock */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`font-mono tabular-nums font-bold text-sm ${
                                isOut
                                  ? 'text-rose-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {prod.stock}
                            </span>
                            <span className="text-[10px] text-slate-400 block">units</span>
                          </td>

                          {/* Min Stock */}
                          <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-500">
                            {prod.minStock}
                          </td>

                          {/* Stock Status */}
                          <td className="py-3.5 px-4">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Out of stock</span>
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Low stock alert</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Optimal</span>
                              </span>
                            )}
                          </td>

                          {/* Valuation */}
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-slate-900">
                            ₱{val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Quick Adjust +/- Buttons */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1 border border-slate-200 rounded-md bg-white p-0.5">
                              <button
                                onClick={() => handleQuickAdjust(prod, -1)}
                                disabled={prod.stock <= 0}
                                title="Deduct 1 unit"
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-mono text-[11px] text-slate-500">
                                {prod.stock}
                              </span>
                              <button
                                onClick={() => handleQuickAdjust(prod, 1)}
                                title="Add 1 unit"
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => openStockModal(prod.name, 'Incoming')}
                                title="Receive stock / Restock"
                                className="text-emerald-700 hover:text-emerald-800 text-[11px] font-semibold underline"
                              >
                                Restock
                              </button>
                              <button
                                onClick={() => openEditProductModal(prod)}
                                title="Edit product"
                                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                title="Delete product"
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                          <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-medium text-slate-600">No products match your current filter</p>
                          <p className="text-[11px] text-slate-400 mt-1">Try resetting the search terms or category selection.</p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('All');
                              setStockStatusFilter('all');
                            }}
                            className="mt-3 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Summary */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
                <span>
                  Showing <strong className="text-slate-700 font-mono">{filteredProducts.length}</strong> of{' '}
                  <strong className="text-slate-700 font-mono">{products.length}</strong> catalog items
                </span>
                <span className="font-mono tabular-nums">
                  Filtered Inventory Value:{' '}
                  <strong className="text-slate-900">
                    ₱{filteredProducts.reduce((acc, curr) => acc + (curr.price * curr.stock), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 3: STOCK MOVEMENTS ===================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-5">
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Movements & Audit Ledger</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete history of warehouse receipts (Incoming) and representative order releases (Outgoing)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openStockModal(undefined, 'Incoming')}
                  className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  <span>Log Incoming (Stock In)</span>
                </button>
                <button
                  onClick={() => openStockModal(undefined, 'Outgoing')}
                  className="inline-flex items-center space-x-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Log Outgoing (Stock Out)</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter transactions by product, representative, or ref #..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto">
                <button
                  onClick={() => setTxFilter('all')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    txFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Logs ({transactions.length})
                </button>
                <button
                  onClick={() => setTxFilter('Incoming')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    txFilter === 'Incoming' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Incoming ({transactions.filter(t => t.type === 'Incoming').length})</span>
                </button>
                <button
                  onClick={() => setTxFilter('Outgoing')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    txFilter === 'Outgoing' ? 'bg-white text-rose-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Outgoing ({transactions.filter(t => t.type === 'Outgoing').length})</span>
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4">Handler / Representative</th>
                      <th className="py-3 px-4">Reference #</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date */}
                        <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                          {tx.date}
                        </td>

                        {/* Movement Type Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                              tx.type === 'Incoming'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {tx.type === 'Incoming' ? (
                              <>
                                <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                <span>Incoming (In)</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3 h-3 text-rose-600" />
                                <span>Outgoing (Out)</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {tx.product}
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                          <span className={tx.type === 'Incoming' ? 'text-emerald-700' : 'text-rose-700'}>
                            {tx.type === 'Incoming' ? `+${tx.qty}` : `-${tx.qty}`}
                          </span>{' '}
                          <span className="text-[10px] text-slate-400 font-normal">units</span>
                        </td>

                        {/* User / Handler */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {tx.user}
                        </td>

                        {/* Reference */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {tx.reference || '—'}
                        </td>

                        {/* Notes */}
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                          {tx.notes || '—'}
                        </td>
                      </tr>
                    ))}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                          No transaction records found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Summary */}
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <span>Showing {filteredTransactions.length} movements</span>
                <span className="font-mono tabular-nums">
                  Net volume:{' '}
                  <strong className="text-slate-800">
                    {transactions
                      .filter(t => t.type === 'Incoming')
                      .reduce((acc, c) => acc + c.qty, 0) -
                      transactions
                        .filter(t => t.type === 'Outgoing')
                        .reduce((acc, c) => acc + c.qty, 0)}{' '}
                    units
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 4: REPORTS & ANALYTICS ===================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Reports & Procurement</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Avon Local Distribution Branch valuation report, procurement requisition sheet, and CSV exporter
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center space-x-1.5 bg-pink-700 hover:bg-pink-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Category Valuation Breakdown Grid */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Category Valuation & Asset Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {categoryStats.map(cat => (
                  <div key={cat.name} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 block">{cat.name}</span>
                    <span className="text-xl font-bold text-pink-900 font-mono tabular-nums block mt-1">
                      ₱{cat.totalValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                      <span>{cat.count} SKUs</span>
                      <span className="font-mono tabular-nums font-medium">{cat.totalUnits} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reorder Procurement Sheet */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Procurement Reorder Requisition Sheet</h3>
                  <p className="text-xs text-slate-500">Items requiring restocking order to Central Distribution</p>
                </div>
                <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  {criticalItems.length} Products at / below buffer
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase">
                      <th className="py-2.5 px-4">Item Name</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4 text-center">Current</th>
                      <th className="py-2.5 px-4 text-center">Min Buffer</th>
                      <th className="py-2.5 px-4 text-center">Suggested Order</th>
                      <th className="py-2.5 px-4 text-right">Est. Unit Cost</th>
                      <th className="py-2.5 px-4 text-right">Est. Reorder Budget</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {criticalItems.map(p => {
                      const suggestedOrderQty = Math.max(10, (p.minStock * 2) - p.stock);
                      const estimatedCost = suggestedOrderQty * p.price;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                          <td className="py-3 px-4 text-slate-500">{p.category}</td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-amber-600">
                            {p.stock}
                          </td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500">
                            {p.minStock}
                          </td>
                          <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-emerald-700">
                            +{suggestedOrderQty} units
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                            ₱{p.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                            ₱{estimatedCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => openStockModal(p.name, 'Incoming')}
                              className="px-2.5 py-1 text-xs bg-pink-700 hover:bg-pink-800 text-white rounded font-medium shadow-2xs"
                            >
                              Create PO
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {criticalItems.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                          <p className="font-semibold text-slate-700">All inventory levels are healthy!</p>
                          <p className="text-[11px] text-slate-400">No items are currently below their minimum thresholds.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick System Utility */}
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Database & System Utilities</span>
                <p className="text-[11px] text-slate-500">Local browser persistence active. Data updates are saved automatically.</p>
              </div>
              <button
                onClick={handleResetData}
                className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-rose-700 px-3 py-1.5 rounded bg-white border border-slate-300 hover:border-rose-300 font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Sample Data</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            AVON Local Distribution Office Stock Management Module · Campaign Operations 2026
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Active SKUs: {products.length} · Balance: {totalStockCount} units
          </div>
        </div>
      </footer>

      {/* ===================== MODAL 1: ADD / EDIT PRODUCT ===================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-pink-700 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">
                  {editingProduct ? 'Edit Avon Product' : 'Add New Avon Product'}
                </h3>
                <p className="text-xs text-pink-200">
                  {editingProduct ? 'Update product information and thresholds' : 'Catalog a new cosmetics item'}
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-pink-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Anew Renewal Power Serum"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs"
                  >
                    <option value="Skincare">Skincare</option>
                    <option value="Fragrance">Fragrance</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="AVN-..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="450.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Buffer *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productForm.minStock}
                    onChange={e => setProductForm({ ...productForm, minStock: e.target.value })}
                    placeholder="5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: STOCK MOVEMENT / TRANSACTION ===================== */}
      {isTransModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`px-5 py-4 text-white flex justify-between items-center ${
                transForm.type === 'Incoming' ? 'bg-emerald-700' : 'bg-rose-700'
              }`}
            >
              <div>
                <h3 className="font-bold text-base">
                  {transForm.type === 'Incoming' ? 'Log Incoming Shipment (Stock In)' : 'Log Representative Order (Stock Out)'}
                </h3>
                <p className="text-xs text-white/80">
                  {transForm.type === 'Incoming'
                    ? 'Replenish stock from warehouse / Central DC'
                    : 'Dispatch beauty products to an Avon Representative'}
                </p>
              </div>
              <button
                onClick={() => setIsTransModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Movement Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTransForm({ ...transForm, type: 'Incoming' })}
                    className={`py-1.5 px-3 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      transForm.type === 'Incoming'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Incoming (Stock In)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransForm({ ...transForm, type: 'Outgoing' })}
                    className={`py-1.5 px-3 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                      transForm.type === 'Outgoing'
                        ? 'bg-white text-rose-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                    <span>Outgoing (Stock Out)</span>
                  </button>
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product *</label>
                <select
                  value={transForm.product}
                  onChange={e => setTransForm({ ...transForm, product: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.category}) — Avail: {p.stock} units
                    </option>
                  ))}
                </select>

                {/* Current Stock Banner */}
                {(() => {
                  const selProd = products.find(p => p.name === transForm.product);
                  if (!selProd) return null;
                  return (
                    <div className="mt-1.5 text-[11px] text-slate-500 flex justify-between bg-slate-50 p-2 rounded border border-slate-200">
                      <span>Current Inventory Balance:</span>
                      <span className="font-mono font-bold text-slate-800">{selProd.stock} units</span>
                    </div>
                  );
                })()}
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity ({transForm.type === 'Incoming' ? 'To Add' : 'To Release'}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transForm.qty}
                  onChange={e => setTransForm({ ...transForm, qty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs font-mono font-bold"
                />
              </div>

              {/* User / Representative */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {transForm.type === 'Incoming' ? 'Received By (Staff / Central DC)' : 'Released To (Representative Name / Customer)'} *
                </label>
                <input
                  type="text"
                  required
                  value={transForm.user}
                  onChange={e => setTransForm({ ...transForm, user: e.target.value })}
                  placeholder="e.g. Representative Maria Santos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs"
                />
              </div>

              {/* Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ref / PO Number</label>
                  <input
                    type="text"
                    value={transForm.reference}
                    onChange={e => setTransForm({ ...transForm, reference: e.target.value })}
                    placeholder="e.g. PO-9012"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                  <input
                    type="text"
                    value={transForm.notes}
                    onChange={e => setTransForm({ ...transForm, notes: e.target.value })}
                    placeholder="Campaign 12 allocation"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-pink-600 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white font-semibold rounded-lg shadow-xs ${
                    transForm.type === 'Incoming'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {transForm.type === 'Incoming' ? 'Confirm Stock Intake' : 'Confirm Order Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
