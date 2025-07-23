// src/pages/dashboard.js
import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Link from 'next/link';
import styles from '../styles/Dashboard.module.css';

// Tentukan batas stok rendah di sini
const LOW_STOCK_THRESHOLD = 5;

export default function DashboardPage() {
  const { products, members, transactions } = useAppContext();

  // Memoize kalkulasi agar tidak dihitung ulang setiap render
  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);

    const revenueToday = transactions
      .filter(t => t.date.startsWith(today))
      .reduce((acc, curr) => acc + curr.total, 0);

    const revenueThisMonth = transactions
      .filter(t => t.date.startsWith(thisMonth))
      .reduce((acc, curr) => acc + curr.total, 0);

    return { revenueToday, revenueThisMonth };
  }, [transactions]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => 
      Object.values(p.stock).some(qty => qty > 0 && qty <= LOW_STOCK_THRESHOLD)
    );
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(p => 
      Object.values(p.stock).every(qty => qty === 0)
    );
  }, [products]);

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Bagian Ringkasan */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <h3>Total Produk</h3>
          <p>{products.length}</p>
        </div>
        <div className={`${styles.card} ${styles.cardSecondary}`}>
          <h3>Total Member</h3>
          <p>{members.length}</p>
        </div>
        <div className={`${styles.card} ${styles.cardSuccess}`}>
          <h3>Pendapatan Hari Ini</h3>
          <p>Rp {summary.revenueToday.toLocaleString('id-ID')}</p>
        </div>
        <div className={`${styles.card} ${styles.cardSuccess}`}>
          <h3>Pendapatan Bulan Ini</h3>
          <p>Rp {summary.revenueThisMonth.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Bagian Peringatan Stok */}
      <div className={styles.alertsGrid}>
        <div className={`${styles.card} ${styles.cardWarning}`}>
          <h3>⚠️ Stok Hampir Habis (≤ {LOW_STOCK_THRESHOLD})</h3>
          {lowStockProducts.length > 0 ? (
            <ul>
              {lowStockProducts.map(p => (
                <li key={p.id}>
                  <Link href="/produk">{p.name}</Link> - 
                  (Ukuran: {Object.entries(p.stock)
                    .filter(([_, qty]) => qty > 0 && qty <= LOW_STOCK_THRESHOLD)
                    .map(([size, qty]) => `${size}: ${qty}`)
                    .join(', ')})
                </li>
              ))}
            </ul>
          ) : (
            <p>Semua stok aman.</p>
          )}
        </div>
        <div className={`${styles.card} ${styles.cardDanger}`}>
          <h3>🚫 Stok Habis</h3>
           {outOfStockProducts.length > 0 ? (
            <ul>
              {outOfStockProducts.map(p => (
                <li key={p.id}>
                  <Link href="/produk">{p.name}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Tidak ada produk yang stoknya habis.</p>
          )}
        </div>
      </div>

    </div>
  );
}