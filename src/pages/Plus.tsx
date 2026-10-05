export const MENU = [
  { path: "/revisions", icon: "🧠", label: "Révisions", sub: "Cartes mémoire à répétition espacée" },
  { path: "/domaine/methode", icon: "🧭", label: "Méthode & astuces", sub: "Apprendre à apprendre, déboguer, chercher, s'organiser" },
  { path: "/certifications", icon: "🎓", label: "Certifications", sub: "Les jalons officiels qui valident vos compétences sur un CV" },
  { path: "/metiers", icon: "🚀", label: "Métiers de demain", sub: "Data, cloud, DevOps : missions, compétences, certifications" },
  { path: "/labo", icon: "🧪", label: "Labo libre", sub: "Python, SQL et terminal Linux pour expérimenter" },
  { path: "/glossaire", icon: "📖", label: "Lexique", sub: "Tous les termes techniques, français et anglais" },
  { path: "/veille", icon: "📡", label: "Veille technologique", sub: "Les nouveautés qui comptent, avec sources" },
  { path: "/recherche", icon: "🔎", label: "Recherche", sub: "Dans les cours, exercices, lexique et notes" },
  { path: "/notes", icon: "🗒️", label: "Mes notes", sub: "Toutes vos annotations" },
  { path: "/profil", icon: "🏅", label: "Progrès & badges", sub: "Statistiques, grades, séries, labos réussis" },
  { path: "/contenus", icon: "📦", label: "Contenus & mises à jour", sub: "Ajouter un domaine, hors connexion" },
  { path: "/reglages", icon: "⚙️", label: "Réglages", sub: "Métier visé, clé IA, voix, thème, sauvegarde" },
  { path: "/aide", icon: "❔", label: "Aide", sub: "Mode d'emploi, installation sur iPhone" },
];

export default function Plus() {
  return (
    <div className="page">
      <h1>Plus</h1>
      <ul className="menu-list">
        {MENU.map((i) => (
          <li key={i.path}>
            <a href={"#" + i.path}>
              <span className="menu-icon">{i.icon}</span>
              <span>
                <strong>{i.label}</strong>
                <small className="muted">{i.sub}</small>
              </span>
              <span className="chev">›</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
