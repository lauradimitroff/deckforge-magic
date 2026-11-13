import AuthForm from "@/components/auth/AuthForm";

export const metadata = { title: "Créer un compte · Deckforge" };

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />;
}
