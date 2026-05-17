import { useState } from "react"
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "../../firebase"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

function UsernameSetup() {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isValid = (name) => {
    return /^[a-z0-9_]{3,20}$/.test(name)

  }

  const handleSubmit = async () => {
    setError("")

    if (!isValid(username)) {
      setError("3-20 chars, lowercase letters, numbers, underscores only")
      return
    }

    setLoading(true)

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      )
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        setError("username already taken, try another!")
        setLoading(false)
        return
      }
      const user = auth.currentUser
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        bio: "",
        createdAt: new Date(),
        lastSeen: new Date(),
        online: true
      })
      window.location.reload()
    } catch (err) {
      setError("something went wrong, try again")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="flex flex-col gap-6 w-80">

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">pick your username</h2>
          <p className="text-slate-400 text-sm">this is how people find you on Vibe</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center bg-slate-800 rounded-lg px-3">
            <span className="text-slate-500 text-sm">@</span>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="your_username"
              className="bg-transparent border-0 text-white placeholder:text-slate-600 focus-visible:ring-0"
              maxLength={20}
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || username.length < 3}
          className="w-full h-11"
        >
          {loading ? "checking..." : "claim username"}
        </Button>

      </div>
    </div>
  )
}

export default UsernameSetup
