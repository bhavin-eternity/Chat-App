import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "../../firebase"
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";



function MomentViewer({ moments, startIndex = 0, onClose }) {
  const { currentUser } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const moment = moments[currentIndex]

  useEffect(() => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goNext()
          return 0
        }
        return prev + (100 / 50)

      })
    }, 100)
    return () => clearInterval(interval)
  }, [currentIndex])

  useEffect(() => {
    if (!moment || moment.uid === currentUser.uid) return
    if (moment.views?.includes(currentUser.uid)) return

    updateDoc(doc(db, "moments", moment.id), {
      views: arrayUnion(currentUser.uid)
    })
  }, [moment])

  const goNext = () => {
    if (currentIndex < moments.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      onClose()
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = timestamp.toDate()
    const diff = Date.now() - date
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    return `${hours}h ago`
  }

  if (!moment) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col max-w-md mx-auto">
      <div className="flex gap-1 px-3 pt-10 pb-2">
        {moments.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{
                width: i < currentIndex
                  ? "100%"
                  : i === currentIndex
                    ? `${progress}%`
                    : "0%"
              }}
            />
          </div>
        ))}
      </div>



      <div className="flex items-center gap-3 px-3 py-2">
        <Avatar className="w-8 h-8 ring-2 ring-white/50">
          <AvatarImage src={moment.photoURL} />
          <AvatarFallback className="bg-slate-700 text-white text-xs">
            {moment.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="text-white text-sm font-medium">@{moment.username}</p>
          <p className="text-white/50 text-xs">{formatTime(moment.createdAt)}</p>
        </div>

        {moment.uid === currentUser.uid && (
          <div className="flex items-center gap-1 text-white/60 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
            </svg>
            {moment.views?.length || 0}
          </div>
        )}

        <button
          onClick={onClose}
          className="text-white/60 hover:text-white ml-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 flex z-10">
          <div className="flex-1" onClick={goPrev} />
          <div className="flex-1" onClick={goNext} />
        </div>

        {moment.type === "image" ? (
          <img
            src={moment.imageURL}
            alt="moment"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`
            w-full h-full flex flex-col items-center justify-center
            ${moment.bgColor || "bg-slate-800"}
            px-8
          `}>
            <p className="text-white text-2xl font-semibold text-center leading-relaxed">
              {moment.caption}
            </p>
          </div>
        )}

        {moment.type === "image" && moment.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-6">
            <p className="text-white text-sm">{moment.caption}</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default MomentViewer
