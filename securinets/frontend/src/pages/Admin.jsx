import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export default function Admin() {
  const [pub, setPub] = useState({ announcements: [] });
  const [members, setMembers] = useState([]);
  const [chat, setChat] = useState([]);
  const [res, setRes] = useState([]);
  const [msg, setMsg] = useState('');
  const [a, setA] = useState({ kind: 'workshop', title: '', date: '', body: '' });
  const [r, setR] = useState({ kind: 'pdf', title: '', workshop: '', url: '' });
  const [n, setN] = useState({ title: '', body: '' });
  const [err, setErr] = useState('');
  const chatEnd = useRef(null);

  const load = () => {
    api('/public').then(setPub).catch(() => {});
    api('/admin/members').then(setMembers).catch(() => {});
    api('/admin/chat').then(setChat).catch(() => {});
    api('/resources').then(setRes).catch(() => {});
  };
  useEffect(() => {
    load();
    const t = setInterval(() => api('/admin/chat').then(setChat).catch(() => {}), 4000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: 'nearest' }); }, [chat.length]);

  // Envoie une action, recharge les données et affiche l'erreur éventuelle
  const act = async (path, method, body) => {
    setErr('');
    try { await api(path, method, body); load(); return true; }
    catch (e) { setErr(e.message); return false; }
  };

  const toggleBan = m => {
    if (m.banned) return act('/admin/members/' + m._id + '/ban', 'PATCH', { banned: false });
    const reason = window.prompt('Raison du bannissement ?');
    if (reason && reason.trim()) act('/admin/members/' + m._id + '/ban', 'PATCH', { banned: true, reason: reason.trim() });
  };

  return (
    <main className="narrow wide">
      <h2>Espace admin</h2>
      {err && <p className="err" role="alert">{err}</p>}

      <div className="card row">
        <span>Inscriptions {pub.signupOpen ? 'ouvertes' : 'fermées'} (journée d'intégration)</span>
        <button className="btn" onClick={() => act('/admin/settings', 'POST', { signupOpen: !pub.signupOpen })}>
          {pub.signupOpen ? 'Fermer' : 'Ouvrir'}
        </button>
      </div>

      <h3>Chat des admins</h3>
      <div className="card chat">
        {chat.map(m => <p key={m._id}><b>{m.author} :</b> {m.text}</p>)}
        <div ref={chatEnd} />
        <form onSubmit={async e => { e.preventDefault(); if (msg.trim() && await act('/admin/chat', 'POST', { text: msg })) setMsg(''); }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message…" maxLength={500} />
        </form>
      </div>

      <h3>Annonces (workshops / CTF)</h3>
      <form className="card" onSubmit={async e => {
        e.preventDefault();
        if (await act('/admin/announcements', 'POST', a)) setA({ kind: a.kind, title: '', date: '', body: '' });
      }}>
        <select value={a.kind} onChange={e => setA({ ...a, kind: e.target.value })}>
          <option value="workshop">Workshop</option><option value="CTF">CTF</option><option value="intégration">Intégration</option>
        </select>
        <input placeholder="Titre" value={a.title} onChange={e => setA({ ...a, title: e.target.value })} required />
        <input type="date" value={a.date} onChange={e => setA({ ...a, date: e.target.value })} required />
        <input placeholder="Détails" value={a.body} onChange={e => setA({ ...a, body: e.target.value })} />
        <button className="btn">Publier</button>
      </form>
      {pub.announcements.map(x => (
        <div key={x._id} className="card row">
          <span>{x.kind} · {x.title} · {new Date(x.date).toLocaleDateString('fr-FR')}</span>
          <button className="ghost" onClick={() => window.confirm('Supprimer cette annonce ?') && act('/admin/announcements/' + x._id, 'DELETE')}>Supprimer</button>
        </div>
      ))}

      <h3>Membres et paiements</h3>
      {members.length === 0 && <p>Aucun membre inscrit pour le moment.</p>}
      {members.map(m => (
        <div key={m._id} className="card row">
          <span>
            {m.name}{m.department && ` · ${m.department}`} · {m.email}
            {m.banned && <> · <b>BANNI</b>{m.banReason && ` (${m.banReason})`}</>}
          </span>
          <span>
            <button className={'pill ' + (m.paid ? 'ok' : 'ko')} onClick={() => act('/admin/members/' + m._id, 'PATCH', { paid: !m.paid })}>
              {m.paid ? 'Payé' : 'Non payé'}
            </button>{' '}
            <button className="ghost" onClick={() => toggleBan(m)}>{m.banned ? 'Débannir' : 'Bannir'}</button>
          </span>
        </div>
      ))}

      <h3>Actualité cybersécurité</h3>
      <form className="card" onSubmit={async e => {
        e.preventDefault();
        if (await act('/admin/news', 'POST', n)) setN({ title: '', body: '' });
      }}>
        <input placeholder="Titre" value={n.title} onChange={e => setN({ ...n, title: e.target.value })} required />
        <input placeholder="Contenu" value={n.body} onChange={e => setN({ ...n, body: e.target.value })} required />
        <button className="btn">Publier</button>
      </form>

      <h3>Ressources des workshops</h3>
      <form className="card" onSubmit={async e => {
        e.preventDefault();
        if (await act('/admin/resources', 'POST', r)) setR({ kind: r.kind, title: '', workshop: '', url: '' });
      }}>
        <input placeholder="Titre" value={r.title} onChange={e => setR({ ...r, title: e.target.value })} required />
        <input placeholder="Workshop" value={r.workshop} onChange={e => setR({ ...r, workshop: e.target.value })} />
        <select value={r.kind} onChange={e => setR({ ...r, kind: e.target.value })}>
          <option value="pdf">PDF</option><option value="enregistrement">Enregistrement</option>
        </select>
        <input type="url" placeholder="Lien (https://…)" value={r.url} onChange={e => setR({ ...r, url: e.target.value })} required />
        <button className="btn">Ajouter</button>
      </form>
      {res.map(x => (
        <div key={x._id} className="card row">
          <span>{x.title} ({x.kind})</span>
          <button className={'pill ' + (x.shared ? 'ok' : 'ko')} onClick={() => act('/admin/resources/' + x._id, 'PATCH', { shared: !x.shared })}>
            {x.shared ? 'Partagé' : 'Privé'}
          </button>
        </div>
      ))}
    </main>
  );
}