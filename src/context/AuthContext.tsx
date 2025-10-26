import React, { createContext, useContext, useState, ReactNode } from "react";
import { createUser, validateUser, User } from "../db/database";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  async function signup(name: string, email: string, password: string) {
    setLoading(true);
    try {
      const id = await createUser({ name, email, password });
      setUser({ id, name, email, password: "" }); // don’t store hash in state
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const found = await validateUser(email, password);
      if (!found) {
        alert("Invalid credentials");
        return;
      }
      setUser({ id: found.id, name: found.name, email: found.email, password: "" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
