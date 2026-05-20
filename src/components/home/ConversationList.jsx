import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";



function ConversationList({ onSelectConversation }) {
    const { currentUser } = useAuth()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!currentUser) return

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", currentUser.uid),
            orderBy("lastMessageTime", "desc")
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()

            }))
            setConversations(convos)
            setLoading(false)

        })

        return () => unsubscribe()
    }, [currentUser])

    const formatTime = (timestamp) => {
        if (!timestamp) return ""
        const date = timestamp.todate()
        const now = new Date();
        const diff = date - now;

        const mins = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (mins < 1) return "now"
        if (mins < 60) return `${mins}m`
        if (hours < 24) return `${hours}h`
        if (days === 1) return "yesterday"
        return date.toLocaleDateString()

    }

    if (loading) {
        return (
            <div className="flex items-center justify-center flex-1">
                <p className="text-slate-600 text-sm animate-pulse">loading chats...</p>
            </div>
        )
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <span className="text-5xl">💬</span>
                <p className="text-slate-500 text-sm">no chats yet</p>
                <p className="text-slate-600 text-xs">search for someone to start talking</p>
            </div>
        )
    }



    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map(convo => {
                const otherUser = convo.participantProfiles?.find(
                    p => p.uid !== currentUser.uid
                )

                const unread = convo.unreadCount?.[currentUser.uid] || 0

                return (
                    <div
                        key={convo.id}
                        onClick={() => onSelectConversation(convo, otherUser)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-900 cursor-pointer transition-colors border-b border-slate-900">
                        <div className="relative">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={otherUser?.photoURL} />
                                <AvatarFallback className="bg-slate-700 text-white">
                                    {otherUser?.username?.[0]?.toUpperCase()}
                                </AvatarFallback>


                            </Avatar>
                            {otherUser?.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />

                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">
                                @{otherUser?.username}
                            </p>
                            <p className="text-slate-500 text-xs truncate">
                                {convo.lastMessage || "say hello 👋"}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-slate-600 text-xs">
                                {formatTime(convo.lastMessageTime)}
                            </span>
                            {unread > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                    {unread}
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}


        </div>
    )
}

export default ConversationList
