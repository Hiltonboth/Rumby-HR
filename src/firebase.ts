import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

console.log("Initializing Firebase with config:", { ...firebaseConfig, apiKey: '***' });
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with long polling to avoid connection issues in some environments
const firestoreDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const db = firestoreDb;

// Test connection to Firestore
async function testConnection() {
  // Wait a bit for the SDK to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("Testing Firestore connection to database:", firebaseConfig.firestoreDatabaseId || '(default)');
  try {
    // We use a dummy path to test the connection
    await getDocFromServer(doc(db, '_connection_test_', 'init'));
    console.log("Firestore connection successful");
  } catch (error) {
    console.error("Firestore connection test failed:", error);
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("CRITICAL: Firestore is offline. This usually means the database ID is wrong or the database is not provisioned.");
      console.log("Current Database ID:", firebaseConfig.firestoreDatabaseId);
      console.log("Current Project ID:", firebaseConfig.projectId);
    }
  }
}

testConnection();

export default app;
