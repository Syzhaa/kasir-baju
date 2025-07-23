// src/pages/produk.js
import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const ITEMS_PER_PAGE = 5;

export default function ProdukPage() {
  const { products } = useAppContext();
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedProducts = useMemo(() => {
    return [...products].reverse();
  }, [products]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, sortedProducts]);
  
  // Hitung nomor awal untuk halaman ini
  const nomorAwal = (currentPage - 1) * ITEMS_PER_PAGE;

  const handleEdit = (product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div>
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

      <div className="card">
        <h2>Daftar Produk</h2>
        {/* Kirim 'nomorAwal' sebagai prop baru */}
        <ProductList 
          products={paginatedProducts} 
          onEdit={handleEdit}
          nomorAwal={nomorAwal} 
        />

        {totalPages > 1 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            <span style={{ margin: '0 15px' }}>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
              disabled={currentPage === totalPages}
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}