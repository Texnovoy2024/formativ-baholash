import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyClkwoij8bNJM6-q4WzSvjuFQCOoDbplUE",
  authDomain: "formativ-baholash.firebaseapp.com",
  databaseURL: "https://formativ-baholash-default-rtdb.firebaseio.com",
  projectId: "formativ-baholash",
  storageBucket: "formativ-baholash.firebasestorage.app",
  messagingSenderId: "280420721756",
  appId: "1:280420721756:web:6b66c47d0d4e331e1cb299"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
