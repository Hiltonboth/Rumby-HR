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
  try {
    // Quiet connection test
    await getDocFromServer(doc(db, '_connection_test_', 'init'));
  } catch (error) {
    // Firestore might be offline if keys are missing or project is starting up. 
    // We log it as a warning only to prevent confusing "Failed to fetch" alerts in some environments.
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore is in offline mode. This is expected if initialization is pending.");
    }
  }
}

testConnection();

export default app;
