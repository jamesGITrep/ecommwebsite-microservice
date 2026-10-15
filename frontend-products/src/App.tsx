
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
              <p className="text-muted" style={{margin: 0}}>${p.basePrice.toFixed(2)}</p>
              <button className="btn" style={{width:'100%', marginTop:'1rem'}} onClick={() => addToCart(p)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
