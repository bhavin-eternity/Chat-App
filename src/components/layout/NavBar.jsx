import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";


function NavBar({ onSearchClick }) {
    const { userProfile } = useAuth();

    const handleLogout = async () => {
        await signOut(auth)
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
            <h1 className="text-xl font-bold text-white">Vibe</h1>
            <div className="flex items-center gap-3">
                <Button
                    onClick={onSearchClick}
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-slate-800">

                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>

                </Button>

                <Avatar className={"w-8 h-8 cursor-pointer"}
                onClick={handleLogout}>
                    <AvatarImage src={userProfile?.photoURL} />
                    <AvatarFallback className={"bg-slate-700 text-white text-sx"}>
                        {userProfile?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>


                </Avatar>

            </div>


        </div>
    )
}

export default NavBar
