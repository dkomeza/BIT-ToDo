import { createContext, useContext, useState, useEffect } from "react";

type User = {
  name: string;
  surname: string;
  email: string;
};

interface AuthProvider {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    surname: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        user: User;
      };
      setUser(data.user);
    } else {
      const data = (await res.json()) as {
        error: string;
      };
      throw new Error(data.error);
    }
  };
  const register = async (
    name: string,
    surname: string,
    email: string,
    password: string
  ) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, surname, email, password }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        user: User;
      };
      setUser(data.user);
    } else {
      const data = (await res.json()) as {
        error: string;
      };
      throw new Error(data.error);
    }
  };
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setUser(null);
  };

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
