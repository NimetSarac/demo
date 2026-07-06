import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Products() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtreler
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 6;

    const navigate = useNavigate();

    // Kategorileri çek
    useEffect(() => {
        api.get('/api/categories')
            .then(response => setCategories(response.data.data))
            .catch(err => console.error('Kategoriler yüklenemedi:', err));
    }, []);

    // Ürünleri çek
    useEffect(() => {
        setLoading(true);

        let url = '';

        if (searchKeyword) {
            // Arama varsa search endpoint'i kullan
            url = `/api/products/search?keyword=${searchKeyword}`;
            api.get(url)
                .then(response => {
                    setProducts(response.data.data);
                    setTotalPages(1);
                    setTotalElements(response.data.data.length);
                    setLoading(false);
                })
                .catch(() => {
                    setError('Ürünler yüklenemedi');
                    setLoading(false);
                });

        } else if (selectedCategory) {
            // Kategori seçiliyse kategoriye göre filtrele
            url = `/api/products/category/${selectedCategory}`;
            api.get(url)
                .then(response => {
                    setProducts(response.data.data);
                    setTotalPages(1);
                    setTotalElements(response.data.data.length);
                    setLoading(false);
                })
                .catch(() => {
                    setError('Ürünler yüklenemedi');
                    setLoading(false);
                });

        } else {
            // Normal sayfalı listeleme
            url = `/api/products/paged?page=${currentPage}&size=${pageSize}&sort=id,desc`;
            api.get(url)
                .then(response => {
                    setProducts(response.data.data.content);
                    setTotalPages(response.data.data.totalPages);
                    setTotalElements(response.data.data.totalElements);
                    setLoading(false);
                })
                .catch(() => {
                    setError('Ürünler yüklenemedi');
                    setLoading(false);
                });
        }

    }, [currentPage, selectedCategory, searchKeyword]);

    const handleAddToCart = (product) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }
        api.post(`/api/cart/${user.id}/items?productId=${product.id}&quantity=1`)
            .then(() => alert(`${product.name} sepete eklendi!`))
            .catch(err => alert('Sepete eklenemedi: ' + err.response?.data?.message));
    };

    if (loading) return <p>Yükleniyor...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Ürünler ({totalElements} ürün)</h2>

            {/* Filtreler */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>

                {/* Arama */}
                <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchKeyword}
                    onChange={e => {
                        setSearchKeyword(e.target.value);
                        setCurrentPage(0);
                    }}
                    style={{ padding: '8px', width: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                {/* Kategori filtresi */}
                <select
                    value={selectedCategory}
                    onChange={e => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(0);
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                {/* Filtreleri temizle */}
                {(searchKeyword || selectedCategory) && (
                    <button
                        onClick={() => {
                            setSearchKeyword('');
                            setSelectedCategory('');
                            setCurrentPage(0);
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer' }}
                    >
                        Filtreleri Temizle
                    </button>
                )}
            </div>

            {/* Ürün Listesi */}
            {products.length === 0 ? (
                <p>Ürün bulunamadı.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {products.map(product => (
                        <div key={product.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            {/* Ürün resmi */}
                            <div style={{
                                background: '#f5f5f5',
                                height: '150px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '40px'
                            }}>
                                🛍️
                            </div>

                            {/* Kategori */}
                            {product.category && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#1976d2',
                                    background: '#e3f2fd',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    alignSelf: 'flex-start'
                                }}>
                                    {product.category.name}
                                </span>
                            )}

                            {/* Ürün adı */}
                            <h3 style={{ margin: 0, fontSize: '16px' }}>{product.name}</h3>

                            {/* Fiyat */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e53935' }}>
                                    {product.price} ₺
                                </span>
                                {product.discount > 0 && (
                                    <span style={{
                                        fontSize: '12px',
                                        color: 'green',
                                        background: '#e8f5e9',
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        %{product.discount} indirim
                                    </span>
                                )}
                            </div>

                            {/* Stok durumu */}
                            <span style={{
                                fontSize: '12px',
                                color: product.stock > 0 ? 'green' : 'red'
                            }}>
                                {product.stock > 0 ? `Stok: ${product.stock}` : 'Stokta yok'}
                            </span>

                            {/* Sepete ekle butonu */}
                            <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0}
                                style={{
                                    marginTop: 'auto',
                                    padding: '10px',
                                    background: product.stock > 0 ? '#1976d2' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {product.stock > 0 ? '🛒 Sepete Ekle' : 'Stokta Yok'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !searchKeyword && !selectedCategory && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
                    <button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 0}
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                    >
                        ← Önceki
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            style={{
                                padding: '8px 12px',
                                background: currentPage === i ? '#1976d2' : 'white',
                                color: currentPage === i ? 'white' : 'black',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages - 1}
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                    >
                        Sonraki →
                    </button>
                </div>
            )}
        </div>
    );
}

export default Products;