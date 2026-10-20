import React, { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { api } from '../api';
// Déposez vos photos dans public/images (hero.jpg, team.jpg, dept1..5.jpg, workshop.jpg, ctf.jpg)
const img = n => ({ backgroundImage: `url(/images/${n}.jpg)` });
const DEPTS = [['Technical Team', 'CTF, pentest, développement et veille technique.'], ['Média', 'Photo, vidéo, design et réseaux sociaux.'],
  ['Sponsoring', 'Partenariats et financement des événements.'], ['Relations Externes', 'Liens avec les clubs, entreprises et universités.'], ['Organisation', "Logistique des workshops et de la journée d'intégration."]];
export default function Home() {
  const [d, setD] = useState({ announcements: [] }); useEffect(() => { api('/public').then(setD).catch(() => {}); }, []);
  return (<main>
    <section className="hero" style={img('hero')}><div className="hero-in"><h1>Apprendre à attaquer pour mieux défendre.</h1>
      <p>Le club de cybersécurité de l'ISTIC : workshops, challenges CTF et une communauté qui progresse ensemble.</p>
      {d.signupOpen ? <Link className="btn big" to="/signup">Rejoindre la promo {d.year}</Link> : <span className="pill">Inscriptions ouvertes pendant la journée d'intégration</span>}</div></section>
    <section id="about" className="split"><div><h2>Qui sommes-nous</h2><p>Securinets ISTIC rassemble les étudiants passionnés de sécurité informatique. Chaque année, nous accueillons de nouveaux membres lors de la journée d'intégration, puis nous organisons des workshops techniques et participons à des compétitions CTF.</p></div><div className="photo" style={img('team')} /></section>
    <section id="departments"><h2>Nos départements</h2><div className="grid">{DEPTS.map(([t, p], i) => <article key={t} className="card"><div className="photo sm" style={img('dept' + (i + 1))} /><h3>{t}</h3><p>{p}</p></article>)}</div></section>
    <section className="split"><div className="photo" style={img('workshop')} /><div><h2>Workshops</h2><p>Des sessions pratiques animées par les membres, avec supports PDF et enregistrements disponibles dans l'espace membre.</p></div></section>
    <section className="split"><div><h2>Challenges CTF</h2><p>Web, crypto, forensics, reverse : entraînez-vous en équipe et représentez l'ISTIC dans les compétitions nationales.</p></div><div className="photo" style={img('ctf')} /></section>
    <section id="events"><h2>Prochains événements</h2><div className="grid">{d.announcements.length === 0 && <p>Aucune annonce pour le moment.</p>}
      {d.announcements.map(a => <article key={a._id} className="card"><span className="pill">{a.kind}</span><h3>{a.title}</h3><p>{new Date(a.date).toLocaleDateString('fr-FR')}</p><p>{a.body}</p></article>)}</div></section>
    <footer>© Securinets ISTIC</footer></main>);
}
