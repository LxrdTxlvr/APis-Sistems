import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Tag, PlusCircle, Trash2, Edit2, X, Plus, Minus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const MOCK_TOKEN = 'mock-token';

function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal Product state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    quantity: '' // stock
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener productos de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/categories`);
      setCategories(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id || '',
      quantity: '10'
    });
    setEditProductId(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      quantity: product.inventory?.quantity || 0
    });
    setEditProductId(product.id);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) return;
    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      fetchProducts();
      setCart(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al eliminar producto');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        initialQuantity: parseInt(formData.quantity),
        quantity: parseInt(formData.quantity) 
      };

      if (editProductId) {
        await axios.put(`${API_URL}/products/${editProductId}`, productData, {
          headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
      } else {
        await axios.post(`${API_URL}/products`, productData, {
          headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar producto');
    } finally {
      setSubmitting(false);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    const stockLimit = product.inventory?.quantity || 0;
    if (stockLimit <= 0) {
      alert('Producto agotado');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= stockLimit) {
          alert(`No puedes añadir más. Stock límite de ${stockLimit} alcanzado.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;
      
      const newQty = item.quantity + delta;
      const stockLimit = item.inventory?.quantity || 0;

      if (newQty <= 0) {
        return prev.filter(i => i.id !== productId);
      }
      if (newQty > stockLimit) {
        alert(`Stock límite de ${stockLimit} alcanzado.`);
        return prev;
      }
      return prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      
      const res = await axios.post(`${API_URL}/products/orders`, { items }, {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      
      setCart([]);
      setIsCartOpen(false);
      
      navigate(`/payments?orderId=${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error al procesar el checkout del pedido');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="glass-panel" style={{animation: 'slideUp 0.4s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1>API de Tienda & Inventario</h1>
          <p>Catálogo de productos cargados dinámicamente y sincronizados con SQLite.</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-outline" onClick={() => setIsCartOpen(true)} style={{position: 'relative'}}>
            <ShoppingCart size={18} /> Carrito 
            {cart.length > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: 'var(--accent-secondary)', color: 'white',
                fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50%',
                fontWeight: 'bold', minWidth: '18px', textAlign: 'center'
              }}>
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusCircle size={18}/> Nuevo Producto
          </button>
        </div>
      </div>

      {error && <div className="badge badge-danger" style={{marginBottom: '16px', padding:'8px 16px', display: 'block'}}>{error}</div>}

      <div className="grid-cards" style={{marginTop: '32px'}}>
        {loading && products.length === 0 ? (
          <p>Cargando productos...</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="glass-panel" style={{display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden'}}>
              <div style={{height: '140px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
                <Package size={48} color="rgba(255,255,255,0.8)" />
                
                <div style={{position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px'}}>
                  <button 
                    className="btn btn-outline" 
                    style={{padding: '6px', borderRadius: '50%', background: 'rgba(20,24,33,0.8)', border: 'none', color: 'var(--text-primary)'}}
                    onClick={() => openEditModal(product)}
                    title="Editar producto"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    className="btn btn-outline" 
                    style={{padding: '6px', borderRadius: '50%', background: 'rgba(20,24,33,0.8)', border: 'none', color: 'var(--danger)'}}
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Eliminar producto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div style={{padding: '20px', flex: 1, display: 'flex', flexDirection: 'column'}}>
                <h3 style={{fontSize: '1.2rem', marginBottom: '8px'}}>{product.name}</h3>
                <p style={{fontSize: '0.9rem', marginBottom: '16px', flex: 1, minHeight: '40px'}}>{product.description}</p>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--panel-border)', paddingTop: '16px'}}>
                  <span style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)'}}>${product.price.toFixed(2)}</span>
                  <span className="badge badge-info"><Tag size={12} style={{marginRight: '4px'}}/> Stock: {product.inventory?.quantity ?? 0}</span>
                </div>
                
                <button 
                  className="btn btn-outline" 
                  style={{marginTop: '16px', width: '100%'}}
                  onClick={() => addToCart(product)}
                  disabled={(product.inventory?.quantity ?? 0) <= 0}
                >
                  <ShoppingCart size={16} /> 
                  {(product.inventory?.quantity ?? 0) <= 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
              </div>
            </div>
          ))
        )}
        {!loading && products.length === 0 && (
          <p style={{gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px'}}>No hay productos en la tienda. ¡Crea uno nuevo!</p>
        )}
      </div>

      {/* Modal Agregar / Editar Producto */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editProductId ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              {formError && <div className="badge badge-danger" style={{width: '100%', marginBottom: '16px', padding: '8px 12px'}}>{formError}</div>}
              
              <div className="input-group">
                <label>Nombre del Producto</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  placeholder="Ej. Mouse Gamer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Descripción</label>
                <textarea 
                  className="input-field" 
                  style={{minHeight: '80px', fontFamily: 'inherit', resize: 'vertical'}}
                  required
                  placeholder="Escribe detalles del producto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{display: 'flex', gap: '16px'}}>
                <div className="input-group" style={{flex: 1}}>
                  <label>Precio (USD)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    className="input-field" 
                    required
                    placeholder="99.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label>Existencias (Stock)</label>
                  <input 
                    type="number" 
                    min="0"
                    className="input-field" 
                    required
                    placeholder="10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Categoría</label>
                <select 
                  className="input-field"
                  style={{background: 'var(--bg-color)', color: 'white'}}
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carrito de Compras */}
      {isCartOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <ShoppingCart size={20} /> Carrito de Compras
              </h3>
              <button onClick={() => setIsCartOpen(false)} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {cart.map(item => (
                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px'}}>
                  <div style={{flex: 1}}>
                    <h4 style={{fontSize: '1rem', color: 'white'}}>{item.name}</h4>
                    <span style={{fontSize: '0.85rem', color: 'var(--success)'}}>${item.price.toFixed(2)} c/u</span>
                  </div>
                  
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)'}}>
                      <button 
                        style={{background: 'transparent', border: 'none', color: 'white', padding: '6px 10px', cursor: 'pointer'}}
                        onClick={() => updateCartQuantity(item.id, -1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{padding: '0 4px', fontSize: '0.95rem', fontWeight: '500'}}>{item.quantity}</span>
                      <button 
                        style={{background: 'transparent', border: 'none', color: 'white', padding: '6px 10px', cursor: 'pointer'}}
                        onClick={() => updateCartQuantity(item.id, 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <span style={{fontSize: '1rem', fontWeight: 'bold', width: '70px', textAlign: 'right'}}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '32px'}}>Tu carrito está vacío.</div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{marginTop: '24px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px'}}>
                  <span>Total:</span>
                  <span style={{color: 'var(--success)'}}>${getCartTotal()}</span>
                </div>
                
                <div className="modal-footer" style={{border: 'none', padding: 0, marginTop: 0}}>
                  <button className="btn btn-outline" onClick={() => setIsCartOpen(false)}>Seguir Comprando</button>
                  <button className="btn btn-primary" onClick={handleCheckout}>Proceder al Pago</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Store;
