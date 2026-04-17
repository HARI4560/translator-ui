import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

// ─── Translation History ──────────────────────────────────────────────────────

export const historyService = {
  /**
   * Save a translation to the user's history.
   * @param {string} uid - Firebase user ID
   * @param {{ sourceText, translatedText, sourceLang, targetLang, culturalRiskScore }} entry
   */
  save: async (uid, entry) => {
    const ref = collection(db, "users", uid, "history");
    const docRef = await addDoc(ref, {
      ...entry,
      timestamp: serverTimestamp(),
    });
    return docRef.id;  // return the ID so callers can delete it later
  },

  /**
   * Fetch all translation history for a user, newest first.
   * @param {string} uid
   * @returns {Promise<Array>}
   */
  getAll: async (uid) => {
    const ref = collection(db, "users", uid, "history");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Delete a single history entry.
   * @param {string} uid
   * @param {string} docId
   */
  deleteOne: async (uid, docId) => {
    const ref = doc(db, "users", uid, "history", docId);
    await deleteDoc(ref);
  },

  /**
   * Delete all history entries for a user using a batch write.
   * @param {string} uid
   */
  clearAll: async (uid) => {
    const ref = collection(db, "users", uid, "history");
    const snapshot = await getDocs(ref);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  },
};

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const feedbackService = {
  /**
   * Submit feedback for a translation.
   * Stored under users/{uid}/feedback (user-private) AND
   * root allFeedback/{docId} (admin-visible).
   * @param {string} uid
   * @param {{ rating, comment, sourceText, translatedText, sourceLang, targetLang, userEmail, userName }} entry
   */
  submit: async (uid, entry) => {
    const timestamp = serverTimestamp();

    // User-private copy
    const userRef = collection(db, "users", uid, "feedback");
    await addDoc(userRef, { ...entry, timestamp });

    // Admin-visible root collection
    const adminRef = collection(db, "allFeedback");
    await addDoc(adminRef, { ...entry, uid, timestamp });
  },

  /**
   * Get all feedback submitted by this user.
   * @param {string} uid
   * @returns {Promise<Array>}
   */
  getMyFeedback: async (uid) => {
    const ref = collection(db, "users", uid, "feedback");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
