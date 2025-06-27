import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const FirebaseContext = createContext();

export function useFirebase() {
    return useContext(FirebaseContext);
}

export function FirebaseProvider({ children, app }) {
    const [user, setUser] = useState(null);

    const auth = getAuth(app);
    const db = getFirestore(app);

    const value = {
        user,
        auth,
        db,
    };

    useEffect(() => {
        const userListener = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return userListener;
    }, [auth]);

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
}


