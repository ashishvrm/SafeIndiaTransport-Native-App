import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { auth, db } from '../config/firebase';

export type AppRole = 'admin' | 'customer';

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  partyId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface UserProfile {
  role: AppRole | null;
  partyId: string | null;
}

async function fetchUserProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { role: null, partyId: null };
  }

  const data = snap.data() as any;
  const role: AppRole | null =
    data.role === 'admin' || data.role === 'customer' ? data.role : null;
  const partyId =
    typeof data.partyId === 'string' && data.partyId.trim().length > 0
      ? data.partyId
      : null;

  return { role, partyId };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setPartyId(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setLoading(true);

      fetchUserProfile(firebaseUser)
        .then((profile) => {
          setRole(profile.role);
          setPartyId(profile.partyId);
        })
        .catch((err) => {
          console.error('[AuthContext] Error fetching profile', err);
          setRole(null);
          setPartyId(null);
        })
        .finally(() => {
          setLoading(false);
        });
    });

    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const value: AuthContextType = {
    user,
    role,
    partyId,
    loading,
    signIn,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
