import Link from "next/link";
import styles from "../legal.module.css";

export const metadata = {
  title: "Crédits · Deckforge",
};

const SOFTWARE = [
  { name: "Next.js", href: "https://nextjs.org", license: "MIT" },
  { name: "React", href: "https://react.dev", license: "MIT" },
  { name: "Drizzle ORM", href: "https://orm.drizzle.team", license: "Apache 2.0" },
  { name: "Neon Auth", href: "https://neon.com/docs/auth/overview", license: "Apache 2.0" },
  { name: "Pilote Neon serverless", href: "https://github.com/neondatabase/serverless", license: "MIT" },
];

const FONTS = [
  { name: "Cinzel", author: "Natanael Gama", href: "https://fonts.google.com/specimen/Cinzel" },
  { name: "Inter", author: "Rasmus Andersson", href: "https://fonts.google.com/specimen/Inter" },
];

export default function CreditsPage() {
  return (
    <article className={styles.doc}>
      <h1 className="display">Crédits</h1>
      <p className={styles.updated}>Deckforge n&apos;existerait pas sans eux.</p>

      <section>
        <h2 className="display">Magic: The Gathering</h2>
        <p>
          Magic: The Gathering, les noms et les textes des cartes, les symboles de mana et les illustrations sont la
          propriété de Wizards of the Coast LLC. Les illustrations appartiennent aussi à leurs artistes, dont le nom
          figure en bas de chaque carte. © Wizards of the Coast LLC.
        </p>
        <p>
          Deckforge est un contenu de fan non officiel, autorisé par la{" "}
          <a href="https://company.wizards.com/fr/legal/fancontentpolicy">politique relative aux contenus de fans</a>.
          Il n&apos;est ni approuvé ni soutenu par Wizards of the Coast.
        </p>
      </section>

      <section>
        <h2 className="display">Scryfall</h2>
        <p>
          Les données des cartes, leurs images et les symboles de mana viennent de l&apos;
          <a href="https://scryfall.com/docs/api">API Scryfall</a>. Merci à toute l&apos;équipe de{" "}
          <a href="https://scryfall.com">Scryfall</a> de les mettre gratuitement à disposition. Deckforge n&apos;est pas
          produit ni soutenu par Scryfall.
        </p>
      </section>

      <section>
        <h2 className="display">Polices</h2>
        <ul className={styles.list}>
          {FONTS.map((f) => (
            <li key={f.name}>
              <span>
                <a href={f.href}>{f.name}</a>, par {f.author}
              </span>
              <span>SIL Open Font License 1.1</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="display">Logiciels libres</h2>
        <ul className={styles.list}>
          {SOFTWARE.map((s) => (
            <li key={s.name}>
              <a href={s.href}>{s.name}</a>
              <span>{s.license}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="display">Hébergement</h2>
        <p>
          Site hébergé par <a href="https://vercel.com">Vercel</a>, base de données et comptes chez{" "}
          <a href="https://neon.com">Neon</a>. Détails dans les <Link href="/mentions-legales">mentions légales</Link>.
        </p>
      </section>
    </article>
  );
}
