
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
              <p className="text-muted" style={{marginBottom: '2rem'}}>Total amount due: <strong style={{color: 'white', fontSize: '1.5rem'}}>${total.toFixed(2)}</strong></p>
              
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

              <button className="btn" style={{width: '100%', fontSize: '1.25rem', padding: '1rem'}} onClick={handlePay}>Pay ${total.toFixed(2)}</button>
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
