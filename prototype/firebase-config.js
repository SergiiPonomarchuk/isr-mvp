// Firebase Web App configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhsBnmpi8zp-Qvo1pnn5f3xwQ7-y1ugwE",
  authDomain: "project-a3d59130-5adf-4677-9e2.firebaseapp.com",
  projectId: "project-a3d59130-5adf-4677-9e2",
  storageBucket: "project-a3d59130-5adf-4677-9e2.firebasestorage.app",
  messagingSenderId: "60798067162",
  appId: "1:60798067162:web:9cbafdf159be83caef3b53",
  measurementId: "G-1EQTTFWG8S"
};

// Export configuration if running in a module environment, or attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
} else {
  window.firebaseConfig = firebaseConfig;
}
