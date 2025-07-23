import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

// Model data default
const initialData = {
  products: [],
  members: [],
  transactions: [],
};

export function AppWrapper({ children }) {
  const [products, setProducts] = useState(initialData.products);
  const [members, setMembers] = useState(initialData.members);
  const [transactions, setTransactions] = useState(initialData.transactions);
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
  useEffect(() => {
    if(isLoaded) localStorage.setItem('products', JSON.stringify(products));
  }, [products, isLoaded]);

  useEffect(() => {
    if(isLoaded) localStorage.setItem('members', JSON.stringify(members));
  }, [members, isLoaded]);

  useEffect(() => {
    if(isLoaded) localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions, isLoaded]);

  // Fungsi Manajemen Produk
  const addProduct = (product) => {
    const newProduct = { ...product, id: uuidv4() };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  // Fungsi Manajemen Member
  const addMember = (member) => {
    const newMember = { ...member, id: uuidv4() };
    setMembers([...members, newMember]);
    return newMember;
  };
  
  // Fungsi Manajemen Transaksi
  const addTransaction = (transactionData) => {
    const { items, member, total, discount } = transactionData;
    
    // 1. Buat transaksi baru
    const newTransaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      items,
      memberId: member ? member.id : null,
      total,
      discount,
    };
    setTransactions(prev => [...prev, newTransaction]);
    
    // 2. Kurangi stok produk
    const updatedProducts = [...products];
    items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if(productIndex !== -1) {
        const product = updatedProducts[productIndex];
        product.stock[item.size] -= item.quantity;
        updatedProducts[productIndex] = product;
      }
    });
    setProducts(updatedProducts);

    // 3. Kosongkan keranjang
    setCart([]);
    return newTransaction;
  };

  // Fungsi Manajemen Keranjang (Cart)
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        cartItem => cartItem.productId === item.productId && cartItem.size === item.size
      );
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.productId === item.productId && cartItem.size === item.size
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prevCart, { ...item, cartId: uuidv4() }];
    });
  };
  
  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  // Fungsi Reset & Backup
  const resetData = () => {
    if (window.confirm("Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat diurungkan.")) {
      localStorage.removeItem('products');
      localStorage.removeItem('members');
      localStorage.removeItem('transactions');
      setProducts([]);
      setMembers([]);
      setTransactions([]);
      setCart([]);
      alert("Semua data berhasil direset.");
    }
  };

  const getBackupData = () => {
    return JSON.stringify({ products, members, transactions }, null, 2);
  };


  const state = {
    products,
    members,
    transactions,
    cart,
    isLoaded,
    addProduct,
    updateProduct,
    deleteProduct,
    addMember,
    addTransaction,
    addToCart,
    removeFromCart,
    clearCart,
    resetData,
    getBackupData,
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}