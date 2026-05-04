"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore }  from "@/store/auth.store";
import type { Profile }  from "@/types";

interface AuthContextValue {
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  isLoading: true,
  isAdmin: false,
  isStaff: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser, clearUser } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    // Fetch session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(profile as Profile);
      } else {
        clearUser();
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setUser(profile as Profile);
        } else if (event === "SIGNED_OUT") {
          clearUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        profile:  user,
        isLoading,
        isAdmin:  user?.role === "admin",
        isStaff:  user?.role === "staff" || user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const useCanWrite = () => {
  const { isAdmin, isStaff } = useAuth();
  return isAdmin || isStaff;
};
