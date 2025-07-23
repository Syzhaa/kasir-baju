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

  // --- Kalkulasi Statistik KPI (Semua Pembayaran) ---
  const dailyStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr));

    const revenueToday = todayTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const itemsSoldToday = todayTransactions.reduce((acc, curr) => acc + curr.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
    
    return {
      revenueToday,
      itemsSoldToday,
    };
  }, [transactions]);

  // --- Statistik Pembayaran Hari Ini (Tetap dipisah untuk insight) ---
  const paymentStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr));

    const tunaiTransactions = todayTransactions.filter(t => (t.paymentMethod || 'Tunai') === 'Tunai');
    const nonTunaiTransactions = todayTransactions.filter(t => (t.paymentMethod || 'Tunai') !== 'Tunai');

    const tunaiRevenue = tunaiTransactions.reduce((acc, curr) => acc + curr.total, 0);
    const nonTunaiRevenue = nonTunaiTransactions.reduce((acc, curr) => acc + curr.total, 0);

    return {
      tunaiRevenue,
      nonTunaiRevenue,
      tunaiCount: tunaiTransactions.length,
      nonTunaiCount: nonTunaiTransactions.length,
    };
  }, [transactions]);

  // --- Persiapan Data untuk Chart Tren 7 Hari (Semua Pembayaran) ---
  const salesTrendData = useMemo(() => {
    const labels = [];
    const tunaiData = [];
    const nonTunaiData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
      
      const dateStr = d.toISOString().slice(0, 10);
      const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));
      
      const tunaiRevenue = dayTransactions
        .filter(t => (t.paymentMethod || 'Tunai') === 'Tunai')
        .reduce((acc, curr) => acc + curr.total, 0);
      
      const nonTunaiRevenue = dayTransactions
        .filter(t => (t.paymentMethod || 'Tunai') !== 'Tunai')
        .reduce((acc, curr) => acc + curr.total, 0);

      tunaiData.push(tunaiRevenue);
      nonTunaiData.push(nonTunaiRevenue);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Pendapatan Tunai',
          data: tunaiData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Pendapatan Non-Tunai',
          data: nonTunaiData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ],
    };
  }, [transactions]);

  // --- Persiapan Data untuk Chart 5 Produk Terlaris (Semua Pembayaran) ---
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
        <div className="card">
          <h3>Penjualan Hari Ini</h3>
          <p>Rp {dailyStats.revenueToday.toLocaleString('id-ID')}</p>
        </div>
        <div className="card">
          <h3>Total Jenis Produk</h3>
          <p>{products.length}</p>
        </div>
        <div className="card">
          <h3>Baju Terjual Hari Ini</h3>
          <p>{dailyStats.itemsSoldToday} Pcs</p>
        </div>
        <div className="card">
          <h3>Pendapatan Tunai</h3>
          <p>Rp {paymentStats.tunaiRevenue.toLocaleString('id-ID')}</p>
          <small>{paymentStats.tunaiCount} Transaksi</small>
        </div>
        <div className="card">
          <h3>Pendapatan Non-Tunai</h3>
          <p>Rp {paymentStats.nonTunaiRevenue.toLocaleString('id-ID')}</p>
          <small>{paymentStats.nonTunaiCount} Transaksi</small>
        </div>
      </div>

      {/* Bagian Chart */}
      <div className={styles.chartsGrid}>
        <div className="card">
          <h3>Tren Penjualan 7 Hari Terakhir</h3>
          <Line 
            options={{ 
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Perbandingan Tunai vs Non-Tunai'
                }
              }
            }} 
            data={salesTrendData} 
          />
        </div>
        <div className="card">
          <h3>5 Produk Terlaris (Keseluruhan)</h3>
          <Bar 
            options={{ 
              responsive: true, 
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: 'Berdasarkan Semua Jenis Pembayaran'
                }
              }
            }} 
            data={topProductsData} 
          />
        </div>
      </div>
    </div>
  );
}