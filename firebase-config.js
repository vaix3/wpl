// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA0UetyVHvuxYVj7gxIsb0couGmmipltaU",
    authDomain: "wplthings.firebaseapp.com",
    projectId: "wplthings",
    storageBucket: "wplthings.firebasestorage.app",
    messagingSenderId: "586098663632",
    appId: "1:586098663632:web:fc43c5c0287ab9f383bed5",
    measurementId: "G-S8GWDVVXDJ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support persistence
      console.log('Persistence not supported by browser');
    }
  });

// Configure Firestore settings
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});