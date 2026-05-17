import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../../firebase"
import { Button } from "../ui/button"

function Login() {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider)

    } catch (error) {
      console.error("Login Failed", error)
    }

  }
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="flex flex-col items-center gap-8">

        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-white">Vibe</h1>
          <p className="text-slate-400 text-sm ">chat. moments. connect.</p>
        </div>
        <div className="w-64" h-64 rounded-full bg-slate-800 flex items-center justify-center>
          <span className="text-8xl">💬</span>
        </div>

        <Button
          onClick={handleSignIn}
          className="w-64 h-12 text-base font-medium">
          Continue with Google

        </Button>
        <p className="text-slate-600 text-xs text-center max-w-xs">
          By continuing you agree to our terms of service
        </p>

      </div>

    </div>
  )
}

export default Login
