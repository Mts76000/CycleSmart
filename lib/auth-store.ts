"use client";

import { useCallback, useEffect, useState } from "react";

export type LocalUser = {
  name: string;
  email: string;
};

const authStorageKey = "cyclesmart-user";

export function readLocalUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(authStorageKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as LocalUser;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    return null;
  }
}

export function saveLocalUser(user: LocalUser) {
  window.localStorage.setItem(authStorageKey, JSON.stringify(user));
}

export function clearLocalUser() {
  window.localStorage.removeItem(authStorageKey);
}

export function useLocalUser() {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(readLocalUser());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const signOut = useCallback(() => {
    clearLocalUser();
    setUser(null);
  }, []);

  return { user, signOut };
}
