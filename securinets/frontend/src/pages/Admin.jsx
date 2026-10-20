import React, { useEffect, useState } from 'react'; import { api } from '../api';
export default function Admin() {
  const [pub, setPub] = useState({ announcements: [] }); const [members, setMembers] = useState([]); const [chat, setChat] = useState([]); const [res, setRes] = useState([]);
  const [msg, setMsg] = useState(''); const [a, setA] = useState({ kind: 'workshop' }); const [r, setR] = useState({ kind: 'pdf' }); const [n, setN] = useState({});
  const load = () => { api('/public').then(setPub); api('/admin/members').then(setMembers); api('/admin/chat').then(setChat); api('/resources').then(setRes); };
  useEffect(() => { load(); const t = setInterval(() => api('/admin/chat').then(setChat), 4000); return () => clearInterval(t); }, []);
  const act = (p, m, b) => api(p, m, b).then(load);
  return (<main className="narrow wide"><h2>Espace admin</h2>
    <div className="card row"><span>Inscriptions {pub.signupOpen ? 'ouvertes' : 'fermées'} (journée d'intégration)</span>
      <button className="btn" onClick={() => act('/admin/settings', 'POST', { signupOpen: !pub.signupOpen })}>{pub.signupOpen ? 'Fermer' : 'Ouvrir'}</button></div>
    <h3>Chat des admins</h3><div className="card chat">{chat.map(m => <p key={m._id}><b>{m.author} :</b> {m.text}</p>)}
      <form onSubmit={e => { e.preventDefault(); act('/admin/chat', 'POST', { text: msg }); setMsg(''); }}><input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message…" /></form></div>
    <h3>Annonces (workshops / CTF)</h3><form className="card" onSubmit={e => { e.preventDefault(); act('/admin/announcements', 'POST', a); }}>
      <select onChange={e => setA({ ...a, kind: e.target.value })}><option value="workshop">Workshop</option><option value="CTF">CTF</option><option value="intégration">Intégration</option></select>
      <input placeholder="Titre" onChange={e => setA({ ...a, title: e.target.value })} required /><input type="date" onChange={e => setA({ ...a, date: e.target.value })} required />
      <input placeholder="Détails" onChange={e => setA({ ...a, body: e.target.value })} /><button className="btn">Publier</button></form>
    {pub.announcements.map(x => <div key={x._id} className="card row"><span>{x.kind} · {x.title} · {new Date(x.date).toLocaleDateString('fr-FR')}</span><button className="ghost" onClick={() => act('/admin/announcements/' + x._id, 'DELETE')}>Supprimer</button></div>)}
    <h3>Membres et paiements</h3>{members.map(m => <div key={m._id} className="card row"><span>{m.name} · {m.department} · {m.email}</span>
      <button className={'pill ' + (m.paid ? 'ok' : 'ko')} onClick={() => act('/admin/members/' + m._id, 'PATCH', { paid: !m.paid })}>{m.paid ? 'Payé' : 'Non payé'}</button></div>)}
    <h3>Actualité cybersécurité</h3><form className="card" onSubmit={e => { e.preventDefault(); act('/admin/news', 'POST', n); }}>
      <input placeholder="Titre" onChange={e => setN({ ...n, title: e.target.value })} required /><input placeholder="Contenu" onChange={e => setN({ ...n, body: e.target.value })} required /><button className="btn">Publier</button></form>
    <h3>Ressources des workshops</h3><form className="card" onSubmit={e => { e.preventDefault(); act('/admin/resources', 'POST', r); }}>
      <input placeholder="Titre" onChange={e => setR({ ...r, title: e.target.value })} required /><input placeholder="Workshop" onChange={e => setR({ ...r, workshop: e.target.value })} />
      <select onChange={e => setR({ ...r, kind: e.target.value })}><option value="pdf">PDF</option><option value="enregistrement">Enregistrement</option></select>
      <input placeholder="Lien (Drive, YouTube…)" onChange={e => setR({ ...r, url: e.target.value })} required /><button className="btn">Ajouter</button></form>
    {res.map(x => <div key={x._id} className="card row"><span>{x.title} ({x.kind})</span>
      <button className={'pill ' + (x.shared ? 'ok' : 'ko')} onClick={() => act('/admin/resources/' + x._id, 'PATCH', { shared: !x.shared })}>{x.shared ? 'Partagé' : 'Privé'}</button></div>)}</main>);
}
