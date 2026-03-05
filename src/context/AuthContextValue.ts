import { createContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    email: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
