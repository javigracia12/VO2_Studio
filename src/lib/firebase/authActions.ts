import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

const googleProvider = new GoogleAuthProvider();

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  return auth;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(requireAuth(), email, password);
}

export async function signInWithGoogle() {
  return signInWithPopup(requireAuth(), googleProvider);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(requireAuth(), email);
}

export async function signOut() {
  return firebaseSignOut(requireAuth());
}
