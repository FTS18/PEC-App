import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';

/** Hook to get current user's organization slug. */
export function useOrgSlug() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  return orgSlug || null;
}

/** Redirects organization-scoped users onto `/:orgSlug/...` routes. */
export function OrgRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user } = usePermissions();

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!user) return;

      try {
        const profileRes = await api.get('/auth/profile');
        const payload = profileRes.data;
        const userData =
          payload && typeof payload === 'object' && 'success' in payload && 'data' in payload
            ? payload.data
            : payload;

        if (!userData) return;

        if (!orgSlug) {
          const resolvedSlug =
            userData.organizationSlug || userData.orgSlug || userData.organization?.slug;

          if (resolvedSlug) {
            const currentPath = window.location.pathname;
            router.replace(`/${resolvedSlug}${currentPath}`);
          }
        }
      } catch (error) {
        console.error('Error checking organization:', error);
      }
    };

    void checkAndRedirect();
  }, [navigate, orgSlug, user]);

  return <>{children}</>;
}
