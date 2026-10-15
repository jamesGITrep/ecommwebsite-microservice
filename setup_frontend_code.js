const fs = require('fs');
const path = require('path');

const globalCSS = `
:root {
  --bg-dark: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.7);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --accent: #8b5cf6;
  --glass-border: rgba(255, 255, 255, 0.1);
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg-dark);
  background-image: radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.15), transparent 25%),
                    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.15), transparent 25%);
  color: var(--text-main);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.btn {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn:hover {
  opacity: 0.9;
}

.input-field {
  width: 100%;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: white;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-links a {
  color: var(--text-main);
  text-decoration: none;
  margin-left: 1.5rem;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-links a:hover { color: var(--primary); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}
`;

const navComponent = `
import React from 'react';
export const NavBar = () => (
  <nav className="nav-bar">
    <div style={{fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
      MFE E-Com
    </div>
    <div className="nav-links">
      <a href="/">Products</a>
      <a href="/search">Search</a>
      <a href="/cart">Cart</a>
    </div>
  </nav>
);
`;

const productsApp = `
import { useEffect, useState } from 'react';
import './index.css';
import { NavBar } from './NavBar';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/catalog/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const addToCart = (product) => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cartItems.find(i => i.id === product.id);
    if(existing) existing.quantity += 1;
    else cartItems.push({ id: product.id, title: product.title, price: product.basePrice, quantity: 1, image: product.media?.[0]?.url });
    localStorage.setItem('cart', JSON.stringify(cartItems));
    alert(product.title + ' added to cart!');
  };

  return (
    <>
      <NavBar />
      <div className="container">
        <h1 style={{marginBottom: '2rem'}}>Premium Catalog</h1>
        <div className="grid">
          {products.map(p => (
            <div key={p.id} className="glass-card">
              <div style={{height: '200px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                 {p.media?.[0]?.url ? <img src={p.media[0].url} style={{maxHeight:'100%', maxWidth:'100%', borderRadius:'8px'}}/> : 'No Image'}
              </div>
              <h3 style={{margin: '0 0 0.5rem'}}>{p.title}</h3>
              <p className="text-muted" style={{margin: 0}}>\${p.basePrice.toFixed(2)}</p>
              <button className="btn" style={{width:'100%', marginTop:'1rem'}} onClick={() => addToCart(p)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
`;

const searchApp = `
import { useState } from 'react';
import './index.css';
import { NavBar } from './NavBar';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/catalog/products');
      const data = await res.json();
      setResults(data.filter(p => p.title.toLowerCase().includes(query.toLowerCase())));
    } catch(err) { console.error(err); }
    setLoading(false);
  }

  return (
    <>
      <NavBar />
      <div className="container">
        <h1 style={{textAlign: 'center', fontSize: '3rem', margin: '4rem 0 2rem'}}>Discover Products</h1>
        <form onSubmit={handleSearch} style={{maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '1rem'}}>
          <input type="text" className="input-field" placeholder="Search for anything..." value={query} onChange={e => setQuery(e.target.value)} style={{marginBottom: 0}} />
          <button type="submit" className="btn">Search</button>
        </form>
        
        <div className="grid" style={{marginTop: '4rem'}}>
           {loading && <p>Searching...</p>}
           {!loading && results.map(p => (
            <div key={p.id} className="glass-card">
              <h3 style={{margin: '0 0 0.5rem'}}>{p.title}</h3>
              <p style={{margin: 0}}>\${p.basePrice.toFixed(2)}</p>
              <button className="btn" style={{width:'100%', marginTop:'1rem'}} onClick={() => window.location.href='/'}>View in Catalog</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
`;

const cartApp = `
import { useEffect, useState } from 'react';
import './index.css';
import { NavBar } from './NavBar';

function App() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const clearCart = () => { localStorage.removeItem('cart'); setCart([]); };

  return (
    <>
      <NavBar />
      <div className="container">
        <h1>Your Shopping Cart</h1>
        {cart.length === 0 ? (
          <div className="glass-card" style={{textAlign: 'center', padding: '4rem'}}>
            <h2>Cart is empty</h2>
            <button className="btn" style={{marginTop: '2rem'}} onClick={() => window.location.href='/'}>Continue Shopping</button>
          </div>
        ) : (
          <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
            <div style={{flex: '2', minWidth: '300px'}}>
              {cart.map(item => (
                <div key={item.id} className="glass-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <div>
                    <h3 style={{margin:0}}>{item.title}</h3>
                    <p style={{margin:0, color: 'var(--text-muted)'}}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{fontSize: '1.25rem', fontWeight: 'bold'}}>\${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{flex: '1', minWidth: '250px', height: 'fit-content'}}>
              <h2 style={{margin: '0 0 1rem'}}>Summary</h2>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', margin: '1.5rem 0', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem'}}>
                <span>Total</span>
                <strong>\${total.toFixed(2)}</strong>
              </div>
              <button className="btn" style={{width: '100%', marginBottom: '1rem'}} onClick={() => window.location.href='/payment'}>Checkout Now</button>
              <button className="btn" style={{width: '100%', background: 'transparent', border: '1px solid var(--glass-border)'}} onClick={clearCart}>Clear Cart</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
`;

const paymentApp = `
import { useEffect, useState } from 'react';
import './index.css';
import { NavBar } from './NavBar';

function App() {
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setTotal(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
  }, []);

  const handlePay = () => {
    setStatus('processing');
    setTimeout(() => { setStatus('success'); localStorage.removeItem('cart'); }, 2000);
  }

  return (
    <>
      <NavBar />
      <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
        <div className="glass-card" style={{width: '100%', maxWidth: '500px', textAlign: 'center', padding: '3rem'}}>
          {status === 'pending' && (
            <>
              <h2 style={{fontSize: '2rem', margin: '0 0 0.5rem'}}>Secure Payment</h2>
              <p className="text-muted" style={{marginBottom: '2rem'}}>Total amount due: <strong style={{color: 'white', fontSize: '1.5rem'}}>\${total.toFixed(2)}</strong></p>
              
              <div style={{textAlign: 'left', marginBottom: '2rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Card Number</label>
                <input type="text" className="input-field" placeholder="0000 0000 0000 0000" />
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Expiry</label>
                    <input type="text" className="input-field" placeholder="MM/YY" />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>CVC</label>
                    <input type="text" className="input-field" placeholder="123" />
                  </div>
                </div>
              </div>

              <button className="btn" style={{width: '100%', fontSize: '1.25rem', padding: '1rem'}} onClick={handlePay}>Pay \${total.toFixed(2)}</button>
            </>
          )}

          {status === 'processing' && (
             <div style={{padding: '3rem 0'}}>
                <h2 style={{margin: '0 0 2rem'}}>Processing Payment...</h2>
                <div style={{width: '50px', height: '50px', border: '5px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite'}}></div>
                <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
             </div>
          )}

          {status === 'success' && (
             <div style={{padding: '3rem 0'}}>
                <div style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem'}}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2 style={{margin: '0 0 0.5rem'}}>Payment Successful!</h2>
                <p className="text-muted">Your order has been placed.</p>
                <button className="btn" style={{marginTop: '2rem'}} onClick={() => window.location.href='/'}>Return to Catalog</button>
             </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
`;

const apps = [
  { dir: 'frontend-products', code: productsApp },
  { dir: 'frontend-search', code: searchApp },
  { dir: 'frontend-cart', code: cartApp },
  { dir: 'frontend-payment', code: paymentApp }
];

apps.forEach(app => {
  const srcDir = path.join(__dirname, app.dir, 'src');
  fs.writeFileSync(path.join(srcDir, 'index.css'), globalCSS);
  fs.writeFileSync(path.join(srcDir, 'NavBar.tsx'), navComponent);
  fs.writeFileSync(path.join(srcDir, 'App.tsx'), app.code);
});
console.log("All frontend code overwritten with rich UI successfully!");
