import { useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../firebase"
import { useAuth } from "../../hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function SearchUsers({ onSelectUser, onClose }) {
  const { currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)

    // don't search if less than 2 characters
    if (value.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      // search for usernames that start with what the user typed
      const q = query(
        collection(db, "users"),
        where("username", ">=", value),
        where("username", "<=", value + "\uf8ff")
      )
      const snapshot = await getDocs(q)

      const users = snapshot.docs
        .map(doc => doc.data())
        .filter(user => user.uid !== currentUser.uid) // exclude yourself

      setResults(users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">

      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <Input
          autoFocus
          value={searchTerm}
          onChange={handleSearch}
          placeholder="search by username..."
          className="bg-slate-800 border-0 text-white placeholder:text-slate-500 focus-visible:ring-0"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="text-slate-500 text-sm text-center mt-8">searching...</p>
        )}

        {!loading && searched && results.length === 0 && (
          <p className="text-slate-500 text-sm text-center mt-8">no users found</p>
        )}

        {!loading && results.map(user => (
          <div
            key={user.uid}
            onClick={() => onSelectUser(user)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.photoURL} />
              <AvatarFallback className="bg-slate-700 text-white text-sm">
                {user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">@{user.username}</p>
              <p className="text-slate-500 text-xs">{user.displayName}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}