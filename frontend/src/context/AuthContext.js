import { useContext, createContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import axios from "axios";
import DeactivationAlert from "../components/Alert/DeactivationAlert";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showDeactivationAlert, setShowDeactivationAlert] = useState(false);
    const [deactivatedUserEmail, setDeactivatedUserEmail] = useState('');
    

    // Google Sign-In (popup, no reload)
    const googleSignin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithPopup(auth, provider);
            console.log("Logged in with popup:", result.user);
        } catch (error) {
            console.error("Google sign-in error:", error.message);
        }
    };

    // Logout
    const logout = () => signOut(auth);

    // Listen for auth changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                console.log("Logged in user:", currentUser);
                console.log("Provider data:", currentUser.providerData?.[0] || "No provider data");

                try {
                    const response = await axios.post(`/user/${currentUser.uid}`, { email: currentUser.email || '' });
                    // Check if user is deactivated
                    if (response.data.deactivated || !response.data.active) {
                        await signOut(auth);
                        setDeactivatedUserEmail(currentUser.email || '');
                        setShowDeactivationAlert(true);
                        return;
                    }
                } catch (error) {
                    if (error.response?.status === 403 && error.response?.data?.deactivated) {
                        await signOut(auth);
                        setDeactivatedUserEmail(currentUser.email || '');
                        setShowDeactivationAlert(true);
                        return;
                    }
                    console.error("Failed to send user data:", error.message);
                }
            } else {
                setUser(null);
                console.log("User logged out");
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCloseDeactivationAlert = () => {
        setShowDeactivationAlert(false);
        setDeactivatedUserEmail('');
    };

    return (
        <AuthContext.Provider value={{ googleSignin, logout, user, authLoading }}>
            {children}
            <DeactivationAlert 
                open={showDeactivationAlert}
                onClose={handleCloseDeactivationAlert}
                userEmail={deactivatedUserEmail}
            />
        </AuthContext.Provider>
    );
};

export const UserAuth = () => useContext(AuthContext);
