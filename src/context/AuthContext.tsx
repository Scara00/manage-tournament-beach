import React, { useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthContext } from "./AuthContextValue";
import {
  signInOrganizer,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
} from "@/lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase authentication
  const login = async (inputEmail: string, inputPassword: string) => {
    const { session, user: authUser } = await signInOrganizer(
      inputEmail,
      inputPassword,
    );
    if (authUser && session) {
      setIsAuthenticated(true);
      setUser(authUser);
      setEmail(authUser.email || null);
    }
  };

  const logout = async () => {
    await supabaseSignOut();
    setIsAuthenticated(false);
    setUser(null);
    setEmail(null);
  };

  // Check authentication status on mount and listen for changes
  React.useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
          setEmail(currentUser.email || null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }

      // Subscribe to auth state changes
      try {
        const { data } = await onAuthStateChange((authUser) => {
          if (authUser) {
            setIsAuthenticated(true);
            setUser(authUser);
            setEmail(authUser.email || null);
          } else {
            setIsAuthenticated(false);
            setUser(null);
            setEmail(null);
          }
        });
        unsubscribe = data?.subscription?.unsubscribe || null;
      } catch (error) {
        console.error("Auth state change subscription error:", error);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        email,
        login,
        logout,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
