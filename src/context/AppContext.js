import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

export function AppWrapper({ children }) {
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data dari LocalStorage saat aplikasi pertama kali dibuka
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const savedMembers = JSON.parse(localStorage.getItem('members')) || [];
    const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    setProducts(savedProducts);
    setMembers(savedMembers);
    setTransactions(savedTransactions);
    setIsLoaded(true);
  }, []);

  // Simpan data ke LocalStorage setiap kali ada perubahan
  useEffect(() => { if (isLoaded) localStorage.setItem('products', JSON.stringify(products)); }, [products, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('members', JSON.stringify(members)); }, [members, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions, isLoaded]);

  // --- Manajemen Produk ---
  const addProduct = (product) => {
    const newProduct = { ...product, id: uuidv4() };
    setProducts(prev => [...prev, newProduct]);
  };
  const updateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  const deleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  // --- Manajemen Member ---
  const addMember = (member) => {
    const newMember = { ...member, id: uuidv4(), discount: Number(member.discount) || 0 };
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };
  const updateMember = (updatedMember) => {
    setMembers(members.map(m => m.id === updatedMember.id ? { ...updatedMember, discount: Number(updatedMember.discount) || 0 } : m));
  };
  const deleteMember = (memberId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus member ini? Riwayat transaksi member ini akan tetap ada.")) {
      setMembers(prevMembers => prevMembers.filter(m => m.id !== memberId));
    }
  };

  // --- Manajemen Transaksi ---
  const addTransaction = (transactionData) => {
    const { items, member, total, discount } = transactionData;
    const newTransaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      items,
      memberId: member ? member.id : null,
      total,
      discount,
    };
    setTransactions(prev => [...prev, newTransaction]);
    
    const updatedProducts = [...products];
    items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        const product = updatedProducts[productIndex];
        product.stock[item.size] -= item.quantity;
        updatedProducts[productIndex] = product;
      }
    });
    setProducts(updatedProducts);
    setCart([]);
    return newTransaction;
  };

  // --- Manajemen Keranjang ---
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(ci => ci.productId === item.productId && ci.size === item.size);
      if (existingItem) {
        return prevCart.map(ci => ci.productId === item.productId && ci.size === item.size ? { ...ci, quantity: ci.quantity + item.quantity } : ci);
      }
      return [...prevCart, { ...item, cartId: uuidv4() }];
    });
  };
  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  const clearCart = () => setCart([]);

  // --- Manajemen Data ---
  const resetData = () => {
    if (window.confirm("Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat diurungkan.")) {
      localStorage.clear();
      setProducts([]); setMembers([]); setTransactions([]); setCart([]);
      alert("Semua data berhasil direset.");
    }
  };
  const getBackupData = () => JSON.stringify({ products, members, transactions }, null, 2);

  const restoreData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      // Validasi sederhana untuk memastikan struktur data benar
      if (Array.isArray(data.products) && Array.isArray(data.members) && Array.isArray(data.transactions)) {
        
        // Minta konfirmasi terakhir sebelum menimpa data
        if (window.confirm("Anda yakin ingin mengganti SEMUA data saat ini dengan data dari file? Tindakan ini tidak dapat diurungkan.")) {
          setProducts(data.products);
          setMembers(data.members);
          setTransactions(data.transactions);
          alert("Data berhasil dipulihkan dari file backup!");
          return true;
        }
      } else {
        alert("Struktur data di dalam file JSON tidak valid. Pastikan file tersebut adalah file backup yang benar.");
        return false;
      }
    } catch (error) {
      console.error("Gagal mem-parsing file JSON:", error);
      alert("File JSON tidak valid atau rusak. Gagal memulihkan data.");
      return false;
    }
    return false; // Return false jika user membatalkan konfirmasi
  };

  const state = {
    products, members, transactions, cart, isLoaded,
    addProduct, updateProduct, deleteProduct,
    addMember, updateMember, deleteMember,
    addTransaction,
    addToCart, removeFromCart, clearCart,
    resetData, getBackupData, restoreData,
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}