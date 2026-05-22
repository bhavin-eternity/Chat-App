import { useAuth } from "@/hooks/useAuth";

function Message({ message }) {
    const { currentUser } = useAuth()
    const isMe = message.senderUid === currentUser.uid;
    const formatTime = (timestamp) => {
        if (!timestamp) return ""
        const date = timestamp.toDate()
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
    }
    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
            <div className={`
        max-w-[70%] px-3 py-2 rounded-2x1 text-sm
         ${isMe
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-100 rounded-bl-sm"
                }
        `}>

                {message.type === "image" && (
                    <img
                        src={message.imageURL}
                        alt="shared"
                        className="rounded-xl max-w-full mb-1"
                    />
                )}

                {message.text && (
                    <p className="leading-relaxed break-words">{message.text}</p>
                )}

                <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] ${isMe ? "text-blue-200" : "text-slate-500"}`}>
                        {formatTime(message.createdAt)}
                    </span>

                    {isMe && (
                        <span className="text-[10px] text-blue-200">
                            {message.read ? "✓✓" : "✓"}
                        </span>
                    )}
                </div>

            </div>

        </div >
    )
}

export default Message
