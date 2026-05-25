import { useState, useEffect, useRef } from "react";
import {
    collection, query, orderBy, onSnapshot,
    doc, updateDoc, writeBatch, getDocs, where
} from "firebase/firestore";
import { db } from "../../firebase"
import { useAuth } from "../../hooks/useAuth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Message from "./Message"
import SendMessage from "./SendMessage"


function ChatRoom({ conversationId, otherUser, onBack }) {
    const { currentUser } = useAuth()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const bottomRef = useRef(null)

    useEffect(() => {
        const q = query(collection(
            db,
            "conversations",
            conversationId,
            "messages"
        ),
            orderBy("createdAt", "asc"))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setMessages(msgs)
            setLoading(false)
        })
        return () => unsubscribe()

    }, [conversationId])

    useEffect(() => {
        if (messages.length === 0 || !otherUser?.uid) return
        const markRead = async () => {
            await updateDoc(doc(db, "conversations", conversationId), {
                [`unreadCount.${currentUser.uid}`]: 0,
            })

            const batch = writeBatch(db)
            const unreadQuery = query(
                collection(db, "conversations", conversationId, "messages"),
                where("senderUid", "==", otherUser.uid),
                where("read", "==", false)
            )
            const unreadSnap = await getDocs(unreadQuery)
            unreadSnap.docs.forEach(msgDoc => {
                batch.update(msgDoc.ref, { read: true })
            })
            await batch.commit()
        }
        markRead()

    }, [messages, conversationId, currentUser?.uid, otherUser?.uid])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])
    return (
        <div className="flex flex-col h-screen bg-slate-950 max-w-md mx-auto">

            {/* header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950">
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <Avatar className="w-9 h-9">
                    <AvatarImage src={otherUser?.photoURL} />
                    <AvatarFallback className="bg-slate-700 text-white text-sm">
                        {otherUser?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <p className="text-white text-sm font-medium">@{otherUser?.username}</p>
                    <p className={`text-xs ${otherUser?.online ? "text-green-400" : "text-slate-500"}`}>
                        {otherUser?.online ? "online" : "offline"}
                    </p>
                </div>
            </div>

            {/* messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                {loading && (
                    <p className="text-slate-600 text-sm text-center animate-pulse">
                        loading messages...
                    </p>
                )}

                {!loading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <span className="text-4xl">👋</span>
                        <p className="text-slate-500 text-sm">
                            say hello to @{otherUser?.username}
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    // show date divider when the date changes between messages
                    const showDate = index === 0 || (
                        messages[index - 1].createdAt?.toDate().toDateString() !==
                        msg.createdAt?.toDate().toDateString()
                    )

                    return (
                        <div key={msg.id}>
                            {showDate && msg.createdAt && (
                                <div className="flex items-center gap-2 my-4">
                                    <div className="flex-1 h-px bg-slate-800" />
                                    <span className="text-slate-600 text-xs">
                                        {msg.createdAt.toDate().toLocaleDateString([], {
                                            weekday: "short", month: "short", day: "numeric"
                                        })}
                                    </span>
                                    <div className="flex-1 h-px bg-slate-800" />
                                </div>
                            )}
                            <Message message={msg} />
                        </div>
                    )
                })}

                {/* invisible div at the bottom — we scroll to this */}
                <div ref={bottomRef} />
            </div>

            <SendMessage conversationId={conversationId} otherUser={otherUser} />
        </div>
    )
}

export default ChatRoom
