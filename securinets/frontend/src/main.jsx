import React, { useState, useEffect } from 'react'; import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { api } from './api'; import Home from './pages/Home'; import Auth from './pages/Auth';
import Member from './pages/Member'; import Admin from './pages/Admin'; import './style.css';

function App() {
  const [user, setUser] = useState(null); const [ready, setReady] = useState(false);
  useEffect(() => { api('/me').then(setUser).catch(() => {}).finally(() => setReady(true)); }, []);
  const login = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  if (!ready) return null;
  return (<BrowserRouter>
    <header className="nav"><Link to="/" className="logo">SECURINETS <span>ISTIC</span></Link>
      <nav><a href="/#about">À propos</a><a href="/#departments">Départements</a><a href="/#events">Événements</a></nav>
      <div className="nav-right">{user ? <>
        <Link to={user.role === 'admin' ? '/admin' : '/espace'}>Mon espace</Link><button className="ghost" onClick={logout}>Quitter</button></> : <>
        <Link to="/login" className="btn ghost">Login</Link><Link to="/signup" className="btn">Signup</Link></>}</div></header>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth mode="login" onAuth={login} />} />
      <Route path="/signup" element={<Auth mode="signup" onAuth={login} />} />
      <Route path="/espace" element={user ? <Member user={user} /> : <Navigate to="/login" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/login" />} />
    </Routes></BrowserRouter>);
}
createRoot(document.getElementById('root')).render(<App />);
