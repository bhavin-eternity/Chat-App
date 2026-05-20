import { useState } from "react"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase"
import { useAuth } from "@/hooks/useAuth"
import NavBar from "../layout/NavBar"
import SearchUsers from "./SearchUsers"
import ConversationList from "./ConversationList"



function Home() {
  const { currentUser, userProfile } = useAuth()
  const [showSearch, setShowSearch] = useState(false)
  const [activeConversation, setActiveConversation] = useState(null)

  const handleSelectUser = async (otherUser) => {
    const ids = [currentUser.uid, otherUser.uid].sort()
    const conversationId = ids.join("_")

    await setDocdoc(doc(db, "conversations", conversationId), {
      participants: [currentUser.uid, otherUser.uid],
      participantProfiles: [
        {
          uid: currentUser.uid,
          username: userProfile.username,
          photoURL: userProfile.photoURL || currentUser.photoURL,
          online: true,
        },
        {
          uid: otherUser.uid,
          username: otherUser.username,
          photoURL: otherUser.photoURL,
          online: otherUser.online || false,
        }
      ],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: {
        [currentUser.uid]: 0,
        [otherUser.uid]: 0,
      }
    }, { merge: true })

    setActiveConversation({ id: conversationId, otherUser })
    setShowSearch(false)

  }

  const handleSelectConversation = (convo, otherUser) => {
    setActiveConversation({ id: convo.id, otherUser })
  }

  if (activeConversation) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 items-center justify-center">
        <p className="text-white">
          Chat with @{activeConversation.otherUser?.username}
        </p>
        <button
          onClick={() => setActiveConversation(null)}
          className="text-slate-400 text-sm mt-4"
        >
          ← back
        </button>

      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 max-w-md mx-auto">
      {showSearch ? (
        <SearchUsers
          onSelectUser={handleSelectUser}
          onClose={() => setShowSearch(false)}
        />
      ) : (
        <>
          <NavBar onSearchClick={() => setShowSearch(true)} />

          <div className="flex flex-col flex-1 overflow-hidden">
            <ConversationList
              onSelectConversation={handleSelectConversation}
            />

          </div>
        </>

      )}

    </div>
  )
}

export default Home
