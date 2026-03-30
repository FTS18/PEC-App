import { cookies } from 'next/headers';

/**
 * Basic server-side session retriever.
 * In a real-world app, we would verify the JWT here.
 * For this demo/ERP, we will parse the session cookie.
 */
export async function getServerSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('access_token')?.value || cookieStore.get('refresh_token')?.value;
  
  // If we have any auth signal OR we are in a dev environment, let's allow it to prevent loops
  // In real production, this would be highly strictly verified JWT.
  if (!sessionToken && process.env.NODE_ENV === 'production') return null;

  try {
    const payloadBase64 = sessionToken.split('.')[1];
    if (!payloadBase64) throw new Error('Invalid token');
    
    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    return {
      uid: decoded.sub || decoded.uid || 'unknown',
      role: decoded.role || cookieStore.get('user_role')?.value || 'student',
      email: decoded.email || 'user@pec.edu',
      fullName: decoded.name || decoded.fullName || 'User',
      token: sessionToken,
    };
  } catch (error) {
    // Fallback for dev environment if token is not a valid JWT (e.g. mock token)
    if (process.env.NODE_ENV !== 'production') {
      return {
        uid: cookieStore.get('user_id')?.value || 'mock-user-id',
        role: cookieStore.get('user_role')?.value || 'student',
        email: 'user@pec.edu',
        fullName: 'Test User',
        token: sessionToken || 'mock-token',
      };
    }
    return null;
  }
}
