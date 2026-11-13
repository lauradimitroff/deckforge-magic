import Link from "next/link";
import { Suspense } from "react";
import { getUser } from "@/lib/auth/dal";
import { cardImageUrl } from "@/lib/scryfall";
import styles from "./home.module.css";

export const metadata = {
  title: "Deckforge · Suis l'évolution de tes decks Magic",
};

// Cartes d'exemple pour illustrer la comparaison (tirées d'un vrai deck Bello).
const SHOWCASE = {
  commander: "Bello, Bard of the Brambles",
  added: ["Bedlam", "Pia, Aether Ascetic"],
  removed: ["Starstorm", "Gruul Turf"],
};

const STEPS = [
  {
    title: "Importe ton deck d'origine",
    text: "Colle ta liste ou importe le .txt exporté d'Archidekt, Moxfield ou Arena.",
  },
  {
    title: "Ajoute ta version modifiée",
    text: "Chaque modification devient une nouvelle version : v2, v3… rien ne se perd.",
  },
  {
    title: "Valide chaque échange",
    text: "➜ pour valider une carte à ajouter, ✖ pour une carte à retirer, puis exporte le deck final.",
  },
];

const FEATURES = [
  { icon: "♛", title: "Ton commandant en vedette", text: "Son illustration et ses couleurs en tête de chaque comparaison." },
  { icon: "▦", title: "Toutes les cartes en image", text: "Classées par type, avec le coût moyen et le nombre de terrains." },
  { icon: "⟲", title: "L'historique de tes decks", text: "Compare n'importe quelles versions entre elles, sur tous tes appareils." },
  { icon: "⇩", title: "Export Archidekt", text: "Le deck final, prêt à réimporter, commandant compris." },
];

export default function WelcomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Pour les joueurs de Commander</p>
          <h1 className="display">
            Fais évoluer tes decks, <span>carte par carte.</span>
          </h1>
          <p className={styles.lead}>
            Compare ton deck d&apos;origine et ton deck modifié, vois en un coup d&apos;œil ce qui entre et ce qui sort,
            et garde l&apos;historique de toutes tes versions.
          </p>
          <Suspense fallback={<div className={styles.ctaPlaceholder} />}>
            <HeroActions />
          </Suspense>
        </div>
        <Showcase />
      </section>

      <section className={styles.section}>
        <h2 className="display">Comment ça marche</h2>
        <ol className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={`${styles.stepNum} display`}>{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden="true">
                {f.icon}
              </span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.closing}`}>
        <h2 className="display">Prêt à comparer ?</h2>
        <p>Gratuit. Un compte pour sauvegarder tes decks, ou un essai immédiat sans inscription.</p>
        <Suspense fallback={<div className={styles.ctaPlaceholder} />}>
          <HeroActions centered />
        </Suspense>
      </section>
    </div>
  );
}

/** Boutons d'action : différents selon qu'on est connecté ou non. */
async function HeroActions({ centered }: { centered?: boolean }) {
  const user = await getUser();
  return (
    <div className={`${styles.ctas} ${centered ? styles.centered : ""}`}>
      {user ? (
        <>
          <Link href="/decks" className={styles.primary}>
            Aller à mes decks
          </Link>
          <Link href="/decks/new" className={styles.secondary}>
            + Nouveau deck
          </Link>
        </>
      ) : (
        <>
          <Link href="/auth/sign-up" className={styles.primary}>
            Créer un compte gratuit
          </Link>
          <Link href="/comparer" className={styles.secondary}>
            Essayer sans compte
          </Link>
          <span className={styles.signin}>
            Déjà inscrit ? <Link href="/auth/sign-in">Se connecter</Link>
          </span>
        </>
      )}
    </div>
  );
}

/** Aperçu de comparaison : le commandant, deux cartes à ajouter, deux à retirer. */
function Showcase() {
  return (
    <div className={styles.showcase} aria-hidden="true">
      <div className={styles.showHero} style={{ backgroundImage: `url("${cardImageUrl(SHOWCASE.commander, "art_crop")}")` }}>
        <span className={styles.showEyebrow}>♛ Commandant</span>
        <span className={`${styles.showName} display`}>{SHOWCASE.commander}</span>
      </div>
      <div className={styles.showCols}>
        <div className={`${styles.showCol} ${styles.remove}`}>
          <span className={styles.showLabel}>✖ À retirer</span>
          <div className={styles.showCards}>
            {SHOWCASE.removed.map((name) => (
              <img key={name} src={cardImageUrl(name)} alt="" />
            ))}
          </div>
        </div>
        <div className={`${styles.showCol} ${styles.add}`}>
          <span className={styles.showLabel}>➜ À ajouter</span>
          <div className={styles.showCards}>
            {SHOWCASE.added.map((name) => (
              <img key={name} src={cardImageUrl(name)} alt="" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
