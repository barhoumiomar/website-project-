import React, { useEffect, useState } from 'react'; import { api } from '../api';
export default function Member({ user }) {
  const [news, setNews] = useState([]); const [res, setRes] = useState([]);
  useEffect(() => { api('/news').then(setNews); api('/resources').then(setRes); }, []);
  return (<main className="narrow wide"><h2>Bonjour {user.name}</h2>
    <div className="card"><h3>Mon compte</h3><p>{user.email} · {user.department}</p>
      <p>Cotisation annuelle (20 DT) : <span className={'pill ' + (user.paid ? 'ok' : 'ko')}>{user.paid ? 'Payée' : 'Non payée'}</span></p></div>
    <h3>Actualités cybersécurité</h3>{news.map(n => <article key={n._id} className="card"><h3>{n.title}</h3><p>{n.body}</p></article>)}
    <h3>Workshops : supports et enregistrements</h3>{res.length === 0 && <p>Rien de partagé pour l'instant.</p>}
    {res.map(r => <article key={r._id} className="card row"><div><strong>{r.title}</strong><br /><small>{r.workshop} · {r.kind}</small></div><a className="btn" href={r.url} target="_blank" rel="noreferrer">{r.kind === 'pdf' ? 'Ouvrir le PDF' : 'Regarder'}</a></article>)}</main>);
}
