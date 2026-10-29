// Firebase web config. These values are public by design (they ship to every
// browser); what protects the data is the database rules in database.rules.json.
export const firebaseConfig = {
  apiKey: "AIzaSyAFf37rXOtI8O0Pfz_TsKzn9KQ6JLYadok",
  authDomain: "artemisuavwebsite.firebaseapp.com",
  databaseURL: "https://artemisuavwebsite-default-rtdb.firebaseio.com",
  projectId: "artemisuavwebsite",
  storageBucket: "artemisuavwebsite.firebasestorage.app",
  messagingSenderId: "1018877760562",
  appId: "1:1018877760562:web:f7d82a009e512d1166582b",
  measurementId: "G-1301DTCMNR",
};

/** The Realtime Database, loaded on first use so the SDK stays out of the page bundle. */
export async function getDb() {
  const [{ getApps, initializeApp }, { getDatabase }] = await Promise.all([
    import("firebase/app"),
    import("firebase/database"),
  ]);
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return getDatabase(app);
}
