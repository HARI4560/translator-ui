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

// ─── Contact Messages ──────────────────────────────────────────────────────────

export const contactService = {
  submit: async (entry) => {
    const ref = collection(db, "contactMessages");
    await addDoc(ref, { ...entry, timestamp: serverTimestamp(), status: 'unread' });
  },

  getAll: async () => {
    const ref = collection(db, "contactMessages");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  
  markAsRead: async (docId) => {
    // Only used to demonstrate marking a message as read in the admin panel
    const docRef = doc(db, "contactMessages", docId);
    await writeBatch(db).update(docRef, { status: 'read' }).commit(); // Actually just direct update is fine but using batch is okay or updateDoc
  }
};

// ─── Admin Services ────────────────────────────────────────────────────────────

export const adminService = {
  getTopFeedbackUsers: async () => {
    const ref = collection(db, "allFeedback");
    const snapshot = await getDocs(ref);
    
    const userCounts = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const email = data.userEmail || "Anonymous";
      const name = data.userName || "Unknown User";
      if (!userCounts[email]) {
        userCounts[email] = { email, name, count: 0 };
      }
      userCounts[email].count += 1;
    });

    const sortedUsers = Object.values(userCounts).sort((a, b) => b.count - a.count);
    return sortedUsers.slice(0, 10);
  },
  
  getAllFeedback: async () => {
    const ref = collection(db, "allFeedback");
    const q = query(ref, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  getDashboardMetrics: async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const feedbackSnap = await getDocs(collection(db, "allFeedback"));
    const msgSnap = await getDocs(collection(db, "contactMessages"));
    
    return {
      totalUsers: usersSnap.size,
      totalFeedback: feedbackSnap.size,
      totalMessages: msgSnap.size
    };
  }
};
