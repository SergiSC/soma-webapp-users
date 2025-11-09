import { User } from "./api";

const USER_STORAGE_KEY = "soma_user";

/**
 * Save user data to localStorage
 */
export function saveUserToStorage(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user to localStorage:", error);
  }
}

/**
 * Load user data from localStorage
 */
export function loadUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch (error) {
    console.error("Failed to load user from localStorage:", error);
    return null;
  }
}

/**
 * Clear user data from localStorage
 */
export function clearUserFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear user from localStorage:", error);
  }
}

