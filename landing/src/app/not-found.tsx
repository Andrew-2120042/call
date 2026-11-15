import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="max-w-xl py-32 text-center">
      <p className="text-faint text-sm">404</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">This page doesn&apos;t exist</h1>
      <div className="mt-8"><ButtonLink href="/">Back to home</ButtonLink></div>
    </Container>
  );
}
