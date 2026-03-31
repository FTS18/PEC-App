import { Metadata } from 'next';

export const experimental_ppr = true;

export const metadata: Metadata = {
  title: 'User Profile | PEC APP ERP',
  description: 'Manage institutional identity and academic profile data.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
