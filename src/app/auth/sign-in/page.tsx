import AuthForm from "@/components/auth/AuthForm";

export const metadata = { title: "Se connecter · Deckforge" };

export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
