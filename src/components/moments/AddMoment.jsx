import { useState } from "react";
import { db } from "../../firebase"
import {
    collection,
    addDoc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore"
import { useAuth } from "@/hooks/useAuth";
import { uploadImage } from "@/lib/uploadImage";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const BG_COLORS = [
    { label: "midnight", value: "bg-slate-800", hex: "#1e293b" },
    { label: "ocean", value: "bg-blue-600", hex: "#2563eb" },
    { label: "forest", value: "bg-emerald-700", hex: "#047857" },
    { label: "sunset", value: "bg-orange-500", hex: "#f97316" },
    { label: "rose", value: "bg-rose-600", hex: "#e11d48" },
    { label: "violet", value: "bg-violet-600", hex: "#7c3aed" },
]


function AddMoment({ onClose, onPosted }) {
    const { currentUser, userProfile } = useAuth()

    const [tab, setTab] = useState("text")
    const [caption, setCaption] = useState("")
    const [bgColor, setBgColor] = useState(BG_COLORS[0])
    const [imageFile, setImageFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")

    const handleImagePick = (e) => {
        const file = e.target.file[0]
        if (!file) return
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handlePost = async () => {
        if (tab === "text" && !caption.trim()) {
            setError("Write Something First !")
            return
        }

        if (tab === "image" && !imageFile) {
            setError("pick an image first")
            return
        }

        setUploading(true)
        setError("")

        try {
            let imageURL = ""

            if (tab === "image") {
                imageURL = await uploadImage(imageFile)
            }

            const expiresAt = Timestamp.fromDate(
                new Date(Date.now() + 24 * 60 * 60 * 1000)
            )

            await addDoc(collection(db, "moments"), {
                uid: currentUser.uid,
                username: userProfile.username,
                photoURL: userProfile.photoURL || currentUser.photoURL,
                type: tab,
                imageURL,
                caption: caption.trim(),
                bgColor: bgColor.value,
                bgHex: bgColor.hex,
                createdAt: serverTimestamp(),
                expiresAt,
                views: [],
            })
            onPosted?.()
            onClose()
        } catch (err) {
            console.error(err)
            setError("something went wrong, try again")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 max-w-md mx-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <h2 className="text-white font-medium">new moment</h2>
                <Button
                    onClick={handlePost}
                    disabled={uploading}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                >
                    {uploading ? "posting..." : "post"}
                </Button>
            </div>

            <div className="flex border-b border-slate-800">
                {["text", "image"].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`
              flex-1 py-3 text-sm font-medium transition-colors
              ${tab === t
                                ? "text-white border-b-2 border-blue-500"
                                : "text-slate-500 hover:text-slate-300"
                            }
            `}
                    >
                        {t} moment
                    </button>
                ))}
            </div>
            <div className="flex-1 flex flex-col gap-5 p-4 overflow-y-auto">
                {tab === "text" && (
                    <>
                        {/* live preview */}
                        <div className={`
              ${bgColor.value} rounded-2xl p-6
              flex items-center justify-center min-h-48
            `}>
                            <p className="text-white text-lg font-medium text-center leading-relaxed break-words">
                                {caption || "your moment preview..."}
                            </p>
                        </div>

                        <Input
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="what's on your mind?"
                            maxLength={200}
                            className="bg-slate-800 border-0 text-white placeholder:text-slate-600 focus-visible:ring-0"
                        />

                        <div>
                            <p className="text-slate-500 text-xs mb-2">background</p>
                            <div className="flex gap-2">
                                {BG_COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setBgColor(color)}
                                        className={`
                      w-8 h-8 rounded-full transition-transform
                      ${color.value}
                      ${bgColor.value === color.value
                                                ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110"
                                                : "hover:scale-105"
                                            }
                    `}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {tab === "image" && (
                    <>
                        {preview ? (
                            <div className="relative rounded-2xl overflow-hidden">
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-full object-cover rounded-2xl"
                                />
                                <button
                                    onClick={() => { setPreview(null); setImageFile(null) }}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center min-h-48 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-slate-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 mb-2">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                                    <circle cx="12" cy="13" r="3" />
                                </svg>
                                <p className="text-slate-500 text-sm">tap to pick a photo</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImagePick}
                                    className="hidden"
                                />
                            </label>
                        )}

                        <Input
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="add a caption... (optional)"
                            maxLength={200}
                            className="bg-slate-800 border-0 text-white placeholder:text-slate-600 focus-visible:ring-0"
                        />
                    </>
                )}

                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}
            </div>
        </div>
    )
}

export default AddMoment
