
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
