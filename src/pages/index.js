// src/pages/index.js
import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Dashboard.module.css';

// Import komponen chart dan daftarkan modul yang diperlukan
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export default function DashboardPage() {
  const { products, transactions } = useAppContext();

  // --- Kalkulasi Statistik KPI ---
  const dailyStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr));

    const revenueToday = todayTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const itemsSoldToday = todayTransactions.reduce((acc, curr) => acc + curr.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
    const memberTransactions = todayTransactions.filter(t => t.memberId).length;
    const nonMemberTransactions = todayTransactions.filter(t => !t.memberId).length;
    
    return {
      revenueToday,
      itemsSoldToday,
      memberTransactions,
      nonMemberTransactions,
    };
  }, [transactions]);

  // --- Persiapan Data untuk Chart Tren 7 Hari ---
  const salesTrendData = useMemo(() => {
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
      
      const dateStr = d.toISOString().slice(0, 10);
      const dailyRevenue = transactions
        .filter(t => t.date.startsWith(dateStr))
        .reduce((acc, curr) => acc + curr.total, 0);
      data.push(dailyRevenue);
    }
    
    return {
      labels,
      datasets: [{
        label: 'Pendapatan',
        data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }],
    };
  }, [transactions]);

  // --- Persiapan Data untuk Chart 5 Produk Terlaris ---
  const topProductsData = useMemo(() => {
    const productSales = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });

    const sortedProducts = Object.entries(productSales)
      .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
      .slice(0, 5);
      
    const labels = sortedProducts.map(([productId]) => {
      const product = products.find(p => p.id === productId);
      return product ? product.name : 'Produk Dihapus';
    });
    const data = sortedProducts.map(([, qty]) => qty);

    return {
      labels,
      datasets: [{
        label: 'Jumlah Terjual',
        data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      }],
    };
  }, [transactions, products]);

  return (
    <div>
      
      {/* Bagian Statistik KPI */}
      <div className={styles.kpiGrid}>
        <div className="card"><h3>Penjualan Hari Ini</h3><p>Rp {dailyStats.revenueToday.toLocaleString('id-ID')}</p></div>
        <div className="card"><h3>Total Jenis Produk</h3><p>{products.length}</p></div>
        <div className="card"><h3>Baju Terjual Hari Ini</h3><p>{dailyStats.itemsSoldToday} Pcs</p></div>
        <div className="card"><h3>Pembelian (Member)</h3><p>{dailyStats.memberTransactions} Transaksi</p></div>
        <div className="card"><h3>Pembelian (Non-Member)</h3><p>{dailyStats.nonMemberTransactions} Transaksi</p></div>
      </div>

      {/* Bagian Chart */}
      <div className={styles.chartsGrid}>
        <div className="card">
          <h3>Tren Penjualan 7 Hari Terakhir</h3>
          <Line options={{ responsive: true }} data={salesTrendData} />
        </div>
        <div className="card">
          <h3>5 Produk Terlaris</h3>
          <Bar options={{ responsive: true, indexAxis: 'y' }} data={topProductsData} />
        </div>
      </div>
    </div>
  );
}