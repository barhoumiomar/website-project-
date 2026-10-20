import React, { useState, useEffect } from 'react'; import { useNavigate } from 'react-router-dom'; import { api } from '../api';
const DEPTS = ['Technical Team', 'Média', 'Sponsoring', 'Relations Externes', 'Organisation'];
export default function Auth({ mode, onAuth }) {
  const [f, setF] = useState({ department: DEPTS[0] }); const [err, setErr] = useState(''); const [open, setOpen] = useState(true); const nav = useNavigate();
  useEffect(() => { if (mode === 'signup') api('/public').then(d => setOpen(d.signupOpen)); }, [mode]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => { e.preventDefault(); try { const r = await api('/' + mode, 'POST', f); onAuth(r); nav(r.user.role === 'admin' ? '/admin' : '/espace'); } catch (x) { setErr(x.message); } };
  if (mode === 'signup' && !open) return <main className="narrow"><h2>Inscriptions fermées</h2><p>Le signup n'est disponible que pendant la journée d'intégration annuelle.</p></main>;
  return (<main className="narrow"><h2>{mode === 'login' ? 'Connexion' : 'Créer mon compte'}</h2>
    <form onSubmit={submit}>{mode === 'signup' && <><input placeholder="Nom complet" onChange={set('name')} required />
      <select onChange={set('department')}>{DEPTS.map(d => <option key={d}>{d}</option>)}</select></>}
      <input type="email" placeholder="Email" onChange={set('email')} required /><input type="password" placeholder="Mot de passe" onChange={set('password')} required />
      {err && <p className="err">{err}</p>}<button className="btn">{mode === 'login' ? 'Se connecter' : "S'inscrire"}</button></form></main>);
}
