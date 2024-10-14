import { createContext, useContext, useState, useEffect } from "react";

type User = {
  name: string;
  surname: string;
  email: string;
};

interface AuthProvider {
  user: User | null;
  login: (email: string, password: string) => void;
  register: (
    name: string,
    surname: string,
    email: string,
    password: string
  ) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthProvider);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authenticate().then((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const login = (email: string, password: string) => {};
  const register = (
    name: string,
    surname: string,
    email: string,
    password: string
  ) => {};
  const logout = () => {};

  const authenticate = async () => {
    const res = await fetch("/api/auth");
    if (res.ok) {
      const data = (await res.json()) as {
        user: User;
      };
      return data.user;
    }

    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
