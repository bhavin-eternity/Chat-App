import { useState, useRef } from "react"
import {
  collection, addDoc, serverTimestamp,
  doc, updateDoc, increment
} from "firebase/firestore"
import { db } from "../../firebase"
import { useAuth } from "../../hooks/useAuth"
import { uploadImage } from "../../lib/uploadImage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SendMessage({ conversationId, otherUser }) {
  const { currentUser, userProfile } = useAuth()
  const [text, setText] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const sendMessage = async ({ text = "", imageURL = "", type = "text" }) => {
    if (!text.trim() && !imageURL) return

    const messagesRef = collection(db, "conversations", conversationId, "messages")

    // add the message to the messages subcollection
    await addDoc(messagesRef, {
      text,
      imageURL,
      type,
      senderUid: currentUser.uid,
      senderUsername: userProfile.username,
      createdAt: serverTimestamp(),
      read: false,
    })

    // update the conversation's last message info
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: type === "image" ? "📷 image" : text,
      lastMessageTime: serverTimestamp(),
      // increment unread count for the OTHER person only
      [`unreadCount.${otherUser.uid}`]: increment(1),
    })
  }

  const handleSendText = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setText("") // clear input immediately — feels faster
    await sendMessage({ text: trimmed, type: "text" })
  }

  const handleKeyDown = (e) => {
    // send on Enter key, but not Shift+Enter (that adds a new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const handleImagePick = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const imageURL = await uploadImage(file)
      await sendMessage({ imageURL, type: "image" })
    } catch (err) {
      console.error("Image send failed:", err)
    } finally {
      setUploading(false)
      // reset the file input so the same file can be sent again
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-800 bg-slate-950">

      {/* hidden file input — triggered by the photo button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImagePick}
        className="hidden"
      />

      {/* photo button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
        className="text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        )}
      </Button>

      {/* text input */}
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="message..."
        className="flex-1 bg-slate-800 border-0 text-white placeholder:text-slate-600 focus-visible:ring-0 rounded-full px-4"
      />

      {/* send button */}
      <Button
        onClick={handleSendText}
        disabled={!text.trim() || uploading}
        size="icon"
        className="rounded-full bg-blue-500 hover:bg-blue-600 flex-shrink-0 disabled:opacity-30"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
        </svg>
      </Button>

    </div>
  )
}   