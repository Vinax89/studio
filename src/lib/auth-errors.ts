export const DEFAULT_AUTH_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again.";

export const authErrorMessages: Record<string, string> = {
  "auth/user-not-found": "No account found with this email. Please sign up.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use":
    "This email is already registered. Please sign in.",
  "auth/weak-password":
    "The password is too weak. Please use at least 6 characters.",
  "auth/configuration-not-found":
    "Firebase Authentication is not yet configured. Please ensure Email/Password sign-in is enabled in the Firebase console.",
};
