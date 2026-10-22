import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

// Dossier des images : public/securinets-images
// Fonds : hero, about, departments, team, workshop, ctf, events (.jpg)
// Cartes départements : dept1..dept5 (.jpg)
// Équipe : public/securinets-images/team/ -> firas, salsabil, tassnime, mustapha, ala, darine, wiem, jasser (.jpg)
const IMG = '/securinets-images';
const bg = n => ({ '--bg': `url(${IMG}/${n}.jpg)` });
const photo = n => ({ backgroundImage: `url(${IMG}/${n}.jpg)` });

const DEPTS = [
  ['Technical Team', 'CTF, pentest, développement et veille technique.'],
  ['Média', 'Photo, vidéo, design et réseaux sociaux.'],
  ['Sponsoring', 'Partenariats et financement des événements.'],
  ['Relations Externes', 'Liens avec les clubs, entreprises et universités.'],
  ['Organisation', "Logistique des workshops et de la journée d'intégration."],
];

const TEAM = [
  ['Firas Ben Yedder', 'Président', 'firas', "Dirige le bureau, coordonne les départements et représente Securinets ISTIC."],
  ['Salsabil Hajji', 'Technical Team', 'salsabil', "Pilote le pôle technique : préparation des challenges CTF et encadrement des workshops."],
  ['Tassnime Bouzakher', 'Reverse Engineering', 'tassnime', "Spécialiste du reverse engineering : analyse de binaires et de malwares."],
  ['Mustapha Nefzi', 'Cryptographie', 'mustapha', "Responsable de la cryptographie : algorithmes, protocoles et défis crypto."],
  ['Ala Ounalli', 'Ressources humaines', 'ala', "Gère l'accueil des nouveaux membres, la vie du groupe et la journée d'intégration."],
  ['Darine Mighri', 'Poste à pourvoir', 'darine', "Ce rôle sera annoncé prochainement."],
  ['Wiem Ayari', 'Sponsoring Team', 'wiem', "Développe les partenariats et assure le financement des événements."],
  ['Jasser Ben Amor', 'Média Team', 'jasser', "Crée les visuels, vidéos et contenus des réseaux sociaux du club."],
];
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('');

const Section = ({ id, image, align = 'left', className = '', children }) => (
  <section id={id} className={`bg ${align} ${className}`} style={bg(image)}>
    <div className="wrap">{children}</div>
  </section>
);

export default function Home() {
  const [d, setD] = useState({ announcements: [] });
  useEffect(() => { api('/public').then(setD).catch(() => {}); }, []);

  return (
    <main>
      <Section image="hero" className="hero">
        <h1>Apprendre à attaquer pour mieux défendre.</h1>
        <p>Le club de cybersécurité de l'ISTIC : workshops, challenges CTF et une communauté qui progresse ensemble.</p>
        {d.signupOpen
          ? <Link className="btn big" to="/signup">Rejoindre la promo {d.year}</Link>
          : <span className="pill">Inscriptions ouvertes pendant la journée d'intégration</span>}
      </Section>

      <Section id="about" image="about">
        <h2>Qui sommes-nous</h2>
        <p>Securinets ISTIC rassemble les étudiants passionnés de sécurité informatique. Chaque année, nous accueillons de nouveaux membres lors de la journée d'intégration, puis nous organisons des workshops techniques et participons à des compétitions CTF.</p>
      </Section>

      <Section id="departments" image="departments" className="full">
        <h2>Nos départements</h2>
        <div className="grid">
          {DEPTS.map(([t, p], i) => (
            <article key={t} className="card">
              <div className="photo sm" style={photo('dept' + (i + 1))} />
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="team" image="team" className="full">
        <h2>Notre équipe</h2>
        <div className="team">
          {TEAM.map(([name, role, slug, bio]) => (
            <article key={slug} className="member">
              <div className="avatar">
                <span>{initials(name)}</span>
                <img
                  src={`${IMG}/team/${slug}.jpg`}
                  alt={name}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <h3>{name}</h3>
              <p className="role">{role}</p>
              <p className="bio">{bio}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section image="workshop" align="right">
        <h2>Workshops</h2>
        <p>Des sessions pratiques animées par les membres, avec supports PDF et enregistrements disponibles dans l'espace membre.</p>
      </Section>

      <Section image="ctf">
        <h2>Challenges CTF</h2>
        <p>Web, crypto, forensics, reverse : entraînez-vous en équipe et représentez l'ISTIC dans les compétitions nationales.</p>
      </Section>

      <Section id="events" image="events" className="full">
        <h2>Prochains événements</h2>
        <div className="grid">
          {d.announcements.length === 0 && <p>Aucune annonce pour le moment.</p>}
          {d.announcements.map(a => (
            <article key={a._id} className="card">
              <span className="pill">{a.kind}</span>
              <h3>{a.title}</h3>
              <p>{new Date(a.date).toLocaleDateString('fr-FR')}</p>
              <p>{a.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <footer>© Securinets ISTIC</footer>
    </main>
  );
}