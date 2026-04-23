import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

type ClientFirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

const firebaseConfig: Partial<ClientFirebaseConfig> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const isFilledConfigValue = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export const isFirebaseConfigured = Object.values(firebaseConfig).every(isFilledConfigValue)

let app: FirebaseApp | null = null

if (isFirebaseConfigured) {
  app = getApps()[0] ?? initializeApp(firebaseConfig as ClientFirebaseConfig)
}

export const auth = app ? getAuth(app) : null
export const googleProvider = new GoogleAuthProvider()

