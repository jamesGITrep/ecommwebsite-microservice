
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
              <p style={{margin: 0}}>${p.basePrice.toFixed(2)}</p>
              <button className="btn" style={{width:'100%', marginTop:'1rem'}} onClick={() => window.location.href='/'}>View in Catalog</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
