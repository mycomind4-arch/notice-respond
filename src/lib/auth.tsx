import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { setOwnerContext, clearOwnerContext } from "@/platform/owner-context";

export type UserRole = "customer" | "admin" | "super_admin";

export interface MailMyPDFUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

interface AuthResult {
  error: string | null;
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  user: MailMyPDFUser | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (data: { fullName?: string }) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; role?: string; is_admin?: boolean };
}
interface SupabaseSession { user?: SupabaseAuthUser | null }

type SupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: SupabaseSession | null }; error: unknown }>;
    onAuthStateChange: (cb: (event: string, session: SupabaseSession | null) => void) => { data: { subscription: { unsubscribe: () => void } } };
    signUp: (args: { email: string; password: string; options?: { emailRedirectTo?: string } }) => Promise<{ data: { session: SupabaseSession | null }; error: { message: string } | null }>;
    signInWithPassword: (args: { email: string; password: string }) => Promise<{ error: { message: string } | null }>;
    signInWithOtp: (args: { email: string; options?: { emailRedirectTo?: string } }) => Promise<{ error: { message: string } | null }>;
    resetPasswordForEmail: (email: string, opts?: { redirectTo?: string }) => Promise<{ error: { message: string } | null }>;
    signOut: () => Promise<{ error: { message: string } | null }>;
    updateUser: (data: { data?: Record<string, unknown> }) => Promise<{ error: { message: string } | null }>;
  };
};

async function loadSupabase(): Promise<SupabaseClient | null> {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env || {};
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) as SupabaseClient;
  } catch {
    return null;
  }
}

function mapUser(user: SupabaseAuthUser): MailMyPDFUser {
  const meta = user.user_metadata || {};
  const role: UserRole = meta.role === "super_admin" || meta.role === "admin" || meta.is_admin === true ? (meta.role === "super_admin" ? "super_admin" : "admin") : "customer";
  return { id: user.id, email: user.email || "", fullName: meta.full_name, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MailMyPDFUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    void loadSupabase().then(async (client) => {
      if (!client) {
        setLoading(false);
        setIsConfigured(false);
        clearOwnerContext();
        return;
      }
      setIsConfigured(true);
      const sessionResult = await client.auth.getSession();
      const sessionUser = sessionResult.data.session?.user;
      if (sessionUser?.id) {
        setOwnerContext(sessionUser.id);
        setUser(mapUser(sessionUser));
      } else {
        clearOwnerContext();
        setUser(null);
      }
      setLoading(false);
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user;
        if (nextUser?.id) {
          setOwnerContext(nextUser.id);
          setUser(mapUser(nextUser));
        } else {
          clearOwnerContext();
          setUser(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    });
    return () => subscription?.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = await loadSupabase();
    if (!client) return { error: "MailMyPDF Account is not configured." };
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    if (error) return { error: error.message };
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const client = await loadSupabase();
    if (!client) return { error: "MailMyPDF Account is not configured." };
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    const client = await loadSupabase();
    if (!client) return { error: "MailMyPDF Account is not configured." };
    const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    return { error: error?.message ?? null };
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    const client = await loadSupabase();
    if (!client) return { error: "MailMyPDF Account is not configured." };
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth?mode=reset` });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const client = await loadSupabase();
    if (!client) return;
    await client.auth.signOut();
    clearOwnerContext();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { fullName?: string }): Promise<AuthResult> => {
    const client = await loadSupabase();
    if (!client) return { error: "MailMyPDF Account is not configured." };
    const { error } = await client.auth.updateUser({ data: { full_name: data.fullName } });
    if (error) return { error: error.message };
    setUser((prev) => prev ? { ...prev, fullName: data.fullName } : prev);
    return { error: null };
  }, []);

  return <AuthContext.Provider value={{ user, loading, isConfigured, signUp, signIn, signInWithMagicLink, resetPassword, signOut, updateProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
