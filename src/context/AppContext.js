import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const AppContext = createContext();

export function AppWrapper({ children }) {
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const savedMembers = JSON.parse(localStorage.getItem('members')) || [];
    const savedTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const savedCurrentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    if (savedUsers.length === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = 'password';
      const hashedDefaultPassword = bcrypt.hashSync(defaultPassword, 10); 
      const adminUser = { id: uuidv4(), username: defaultUsername, password: hashedDefaultPassword };
      savedUsers = [adminUser];
      localStorage.setItem('users', JSON.stringify(savedUsers));
    }
    setProducts(savedProducts);
    setMembers(savedMembers);
    setTransactions(savedTransactions);
    setUsers(savedUsers);
    if (savedCurrentUser) { setCurrentUser(savedCurrentUser); }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => { if (!isAuthLoading) localStorage.setItem('products', JSON.stringify(products)); }, [products, isAuthLoading]);
  useEffect(() => { if (!isAuthLoading) localStorage.setItem('members', JSON.stringify(members)); }, [members, isAuthLoading]);
  useEffect(() => { if (!isAuthLoading) localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions, isAuthLoading]);
  useEffect(() => { if (!isAuthLoading) localStorage.setItem('users', JSON.stringify(users)); }, [users, isAuthLoading]);
  useEffect(() => { if (!isAuthLoading) localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser, isAuthLoading]);

  const login = async (username, password) => {
    const user = users.find(u => u.username === username);
    if (!user) throw new Error("Username tidak ditemukan.");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Password salah.");
    setCurrentUser({ id: user.id, username: user.username });
  };
  const logout = () => setCurrentUser(null);
  const updateProfile = async (userId, newPassword) => {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      setUsers(users.map(u => u.id === userId ? { ...u, password: newHashedPassword } : u));
  };

  const addProduct = (product) => setProducts(prev => [...prev, { ...product, id: uuidv4() }]);
  const updateProduct = (updatedProduct) => setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  const deleteProduct = (productId) => setProducts(products.filter(p => p.id !== productId));
  const addMember = (member) => { const newMember = { ...member, id: uuidv4(), discount: Number(member.discount) || 0 }; setMembers(prev => [...prev, newMember]); return newMember; };
  const updateMember = (updatedMember) => setMembers(members.map(m => m.id === updatedMember.id ? { ...updatedMember, discount: Number(updatedMember.discount) || 0 } : m));
  const deleteMember = (memberId) => { if (window.confirm("Yakin hapus member ini?")) { setMembers(prev => prev.filter(m => m.id !== memberId)); } };
  
  const addTransaction = (transactionData) => {
    const { items, member, total, discount, paymentMethod } = transactionData;
    const newTransaction = {
      id: `TRX-${uuidv4().slice(0, 8)}`,
      date: new Date().toISOString(),
      items,
      memberId: member ? member.id : null,
      total,
      discount,
      paymentMethod: paymentMethod,
    };
    setTransactions(prev => [...prev, newTransaction]);
    const updatedProducts = [...products];
    items.forEach(item => {
      const pIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (pIndex !== -1) {
        updatedProducts[pIndex].stock[item.size] -= item.quantity;
      }
    });
    setProducts(updatedProducts);
    setCart([]);
    return newTransaction;
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(ci => ci.productId === item.productId && ci.size === item.size);
      if (existingItem) { return prevCart.map(ci => ci.productId === item.productId && ci.size === item.size ? { ...ci, quantity: ci.quantity + item.quantity } : ci); }
      return [...prevCart, { ...item, cartId: uuidv4() }];
    });
  };
  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  const clearCart = () => setCart([]);
  const resetData = () => { if (window.confirm("Yakin reset semua data?")) { localStorage.removeItem('products'); localStorage.removeItem('members'); localStorage.removeItem('transactions'); setProducts([]); setMembers([]); setTransactions([]); setCart([]); alert("Data produk, member, dan transaksi berhasil direset."); } };
  const getBackupData = () => JSON.stringify({ products, members, transactions }, null, 2);
  const restoreData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.products) && Array.isArray(data.members) && Array.isArray(data.transactions)) {
        if (window.confirm("Anda yakin ingin mengganti SEMUA data saat ini dengan data dari file? Tindakan ini tidak dapat diurungkan.")) {
          setProducts(data.products); setMembers(data.members); setTransactions(data.transactions);
          alert("Data berhasil dipulihkan!");
        }
      } else { alert("Struktur data file JSON tidak valid."); }
    } catch (error) { alert("File JSON tidak valid atau rusak."); }
  };

  const state = {
    products, members, transactions, cart, currentUser, isAuthenticated: !!currentUser, isAuthLoading,
    addProduct, updateProduct, deleteProduct,
    addMember, updateMember, deleteMember,
    addTransaction,
    addToCart, removeFromCart, clearCart,
    resetData, getBackupData, restoreData,
    login, logout, updateProfile
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}
export function useAppContext() { return useContext(AppContext); }