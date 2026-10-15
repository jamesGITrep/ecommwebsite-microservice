
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
                  <div style={{fontSize: '1.25rem', fontWeight: 'bold'}}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{flex: '1', minWidth: '250px', height: 'fit-content'}}>
              <h2 style={{margin: '0 0 1rem'}}>Summary</h2>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', margin: '1.5rem 0', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem'}}>
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
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
