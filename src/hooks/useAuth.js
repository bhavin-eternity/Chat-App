import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase"


export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user)

            if (user) {
                const docRef = doc(db, "users", user.uid)
                
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setUserProfile(docSnap.data())
                } else {
                    setUserProfile(null)
                }
            }
            else {
                setUserProfile(null)
            }
            setLoading(false)

            return () => unsubscribe()
        })
    }, [])
    return { currentUser, userProfile, loading }
}
