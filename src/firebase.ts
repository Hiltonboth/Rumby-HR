import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection to Firestore
async function testConnection() {
  try {
    // We use a dummy path to test the connection
    await getDocFromServer(doc(db, '_connection_test_', 'init'));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline. This usually indicates an incorrect Firebase configuration or that the database is not yet ready.");
    }
    // We don't throw here to avoid crashing the app, but we log the error
  }
}

testConnection();

export default app;
