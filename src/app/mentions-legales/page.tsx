import Link from "next/link";
import { SITE } from "@/lib/site";
import styles from "../legal.module.css";

export const metadata = {
  title: "Mentions légales · Deckforge",
};

function Contact() {
  return (
    <>
      <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
      {SITE.contactEmailIsPlaceholder && <span className={styles.note}>adresse fictive, provisoire</span>}
    </>
  );
}

export default function LegalNoticePage() {
  return (
    <article className={styles.doc}>
      <h1 className="display">Mentions légales</h1>
      <p className={styles.updated}>Dernière mise à jour : 16 novembre 2026</p>

      <section>
        <h2 className="display">Éditeur du site</h2>
        <p>
          {SITE.name} (<a href={SITE.url}>{SITE.url.replace("https://", "")}</a>) est un site personnel, gratuit et non
          commercial, édité par {SITE.editor}, particulier.
        </p>
        <p>Directrice de la publication : {SITE.editor}.</p>
        <p>
          Contact : <Contact />
        </p>
      </section>

      <section>
        <h2 className="display">Hébergement</h2>
        <h3>Site</h3>
        <p>
          Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis —{" "}
          <a href="https://vercel.com">vercel.com</a>. Les pages sont servies depuis la région de Francfort (Allemagne).
        </p>
        <h3>Base de données et comptes</h3>
        <p>
          Neon (Databricks, Inc.) — <a href="https://neon.com">neon.com</a>. Les données sont stockées à Francfort
          (Allemagne).
        </p>
      </section>

      <section>
        <h2 className="display">Données personnelles</h2>
        <h3>Ce qui est enregistré</h3>
        <ul>
          <li>
            <strong>Sans compte</strong> (Comparaison rapide) : rien n&apos;est envoyé au site. Tes listes et tes choix
            restent dans ton navigateur (stockage local) et tu peux les effacer en vidant les données du site.
          </li>
          <li>
            <strong>Avec un compte</strong> : ton adresse e-mail, ton pseudo, ton mot de passe (chiffré, jamais lisible),
            tes decks, leurs versions et les changements que tu valides.
          </li>
        </ul>
        <h3>Pourquoi</h3>
        <p>
          Uniquement pour faire fonctionner le site : te connecter et retrouver tes decks. Aucune publicité, aucune
          revente, aucun suivi d&apos;audience. Base légale : l&apos;exécution du service que tu demandes en créant un
          compte.
        </p>
        <h3>Combien de temps</h3>
        <p>Tant que ton compte existe. Quand il est supprimé, tes decks le sont aussi.</p>
        <h3>Qui y a accès</h3>
        <p>
          Seulement toi, à travers ton compte, et les hébergeurs ci-dessus pour le stockage technique. Chaque deck est
          lié à son propriétaire : un compte ne voit jamais les decks d&apos;un autre.
        </p>
        <h3>Tes droits</h3>
        <p>
          Tu peux consulter, corriger, récupérer ou faire supprimer tes données, ou supprimer ton compte, en écrivant à{" "}
          <Contact />. Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL (
          <a href="https://www.cnil.fr">cnil.fr</a>).
        </p>
      </section>

      <section>
        <h2 className="display">Cookies</h2>
        <p>
          Le site n&apos;utilise qu&apos;un cookie de session, déposé quand tu te connectes, pour te garder connecté. Il
          est indispensable au fonctionnement du compte et ne sert à rien d&apos;autre : aucun consentement n&apos;est
          donc demandé. Aucun cookie publicitaire ni de mesure d&apos;audience.
        </p>
      </section>

      <section>
        <h2 className="display">Services tiers</h2>
        <p>
          Les images et les informations des cartes sont chargées directement depuis{" "}
          <a href="https://scryfall.com">Scryfall</a> par ton navigateur : Scryfall reçoit donc ton adresse IP et le nom
          des cartes affichées, comme pour tout site web. Voir leur{" "}
          <a href="https://scryfall.com/docs/privacy">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2 className="display">Propriété intellectuelle</h2>
        <p>
          {SITE.name} est un contenu de fan non officiel, autorisé par la{" "}
          <a href="https://company.wizards.com/fr/legal/fancontentpolicy">politique relative aux contenus de fans</a> de
          Wizards of the Coast. Il n&apos;est ni approuvé ni soutenu par Wizards of the Coast. Magic: The Gathering, les
          noms, les textes et les illustrations des cartes ainsi que les symboles de mana appartiennent à Wizards of the
          Coast LLC et à leurs artistes.
        </p>
        <p>
          Le reste du site (code, textes, mise en page) appartient à son éditrice. Voir aussi les{" "}
          <Link href="/credits">crédits</Link>.
        </p>
      </section>
    </article>
  );
}
