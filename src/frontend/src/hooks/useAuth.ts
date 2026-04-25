import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const {
    identity,
    login,
    clear,
    loginStatus,
    isInitializing,
    isLoggingIn,
    isAuthenticated,
    isLoginSuccess,
    isLoginError,
    loginError,
  } = useInternetIdentity();

  const principal = identity?.getPrincipal().toText() ?? null;

  return {
    identity,
    principal,
    login,
    logout: clear,
    loginStatus,
    isInitializing,
    isLoggingIn,
    isAuthenticated,
    isLoginSuccess,
    isLoginError,
    loginError,
  };
}
