'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider,
    GithubAuthProvider, 
    User,
    signOut as firebaseSignOut
} from "firebase/auth";
import { app } from './firebaseConfig';

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
}

interface CustomUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<CustomUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const auth = getAuth(app);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            if (firebaseUser) {
                const customUser: CustomUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                };
                setUser(customUser);
                 setIsGuest(false);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/'); // Redirect to dashboard on success
        } catch (error) {
            console.error("Error during Google sign-in:", error);
        }
    };

    const signInWithGithub = async () => {
        const provider = new GithubAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/'); // Redirect to dashboard on success
        } catch (error) {
            console.error("Error during GitHub sign-in:", error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            router.push('/'); // Redirect to home on sign out
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const authValue = {
        user,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        isGuest,
        setIsGuest: (guest: boolean) => {
            setIsGuest(guest);
            if (guest) {
                setUser({ 
                    uid: 'guest', 
                    email: '', 
                    displayName: 'Guest User', 
                    photoURL: '' , 
                    isGuest: true
                });
            }
        }
    };

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};