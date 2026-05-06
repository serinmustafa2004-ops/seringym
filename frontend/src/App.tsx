import { useEffect, useState } from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import type { User } from "./lib/types";
import { INVALID_AUTH_EVENT } from "./lib/api";

type AuthState = {
  token: string;
  user: User;
};

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("gympro_token");
    const userRaw = localStorage.getItem("gympro_user");

    if (token && userRaw) {
      setAuth({ token, user: JSON.parse(userRaw) as User });
    }

    function handleInvalidAuth() {
      setAuth(null);
    }

    window.addEventListener(INVALID_AUTH_EVENT, handleInvalidAuth);
    return () => {
      window.removeEventListener(INVALID_AUTH_EVENT, handleInvalidAuth);
    };
  }, []);

  if (!auth) {
    return (
      <LoginPage
        onLogin={(payload) => {
          localStorage.setItem("gympro_user", JSON.stringify(payload.user));
          setAuth(payload);
        }}
      />
    );
  }

  return (
    <DashboardPage
      user={auth.user}
      onLogout={() => {
        localStorage.removeItem("gympro_token");
        localStorage.removeItem("gympro_user");
        setAuth(null);
      }}
    />
  );
}
