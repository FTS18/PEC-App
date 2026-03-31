import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-auth';
import AuthClient from './AuthClient';

/**
 * Server-side Auth page.
 * Handles initial session check to prevent client-side flicker.
 */
export default async function AuthPage() {
  const session = await getServerSession();

  // If already authenticated, redirect based on role
  if (session) {
    // In a real app, we might check if profile is complete here too
    // For now, let's redirect to dashboard which handles sub-routing
    return redirect('/dashboard');
  }

  return (
    <main className="bg-background">
      <AuthClient initialSessionStatus={!!session} />
    </main>
  );
}

// Metadata for SEO and appearance
export const metadata = {
  title: 'Identity Verification | Punjab Engineering College',
  description: 'Secure institutional sign-in for the PEC APP ERP and academic orchestration platform.',
};
