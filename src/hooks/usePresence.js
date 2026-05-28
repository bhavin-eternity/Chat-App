import { useEffect } from "react";
import {
    ref,
    set,
    onDisconnect,
    serverTimestamp
} from "firebase/database"

import { doc, updateDoc } from "firebase/firestore"
import { rtdb, db } from "../firebase"

export const usePresence = (currentUser) => {
    useEffect(() => {
        if (!currentUser) return

        const presenceRef =
            ref(rtdb, `presence/${currentUser.uid}`)

        set(presenceRef, {
            online: true,
            lastSeen: serverTimestamp(),
        })

        onDisconnect(presenceRef).set({
            online: false,
            lastSeen: serverTimestamp(),
        })

        const userDocRef = doc(db, "users", currentUser.uid)

        updateDoc(userDocRef, {
            online: true,
            lastSeen: new Date(),
        })

        return () => {
            return () => {
                set(presenceRef, {
                    online: false,
                    lastSeen: serverTimestamp(),
                })
                updateDoc(userDocRef, {
                    online: false,
                    lastSeen: new Date(),
                })
            }
        }

    }, [currentUser])
}