// src/pages/produk.js
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

export default function ProdukPage() {
  const { products } = useAppContext();
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Saat tombol edit di-klik, scroll ke atas halaman tempat form berada
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div>
      <h1>Manajemen Produk</h1>
      
      {/* 1. Form Tambah/Edit ditampilkan di atas */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2>{editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk Baru'}</h2>
        <ProductForm 
          key={editingProduct ? editingProduct.id : 'new'}
          productToEdit={editingProduct} 
          onFormSubmit={handleCancelEdit} 
        />
        {editingProduct && (
          <button 
            onClick={handleCancelEdit} 
            className="button-secondary" 
            style={{marginTop: '10px', width: '100%'}}>
            Batal Edit
          </button>
        )}
      </div>

      {/* 2. Daftar Produk ditampilkan di bawah */}
      <div className="card">
        <h2>Daftar Produk</h2>
        <ProductList products={products} onEdit={handleEdit} />
      </div>
    </div>
  );
}