import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import Login from './components/auth/Login'
import UsernameSetup from "./components/auth/UsernameSetup"
import Home from "./components/home/Home"

function App() {
  const { currentUser, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-white text-lg animate-pulse">loading...</div>
      </div>
    )
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !currentUser ? <Login /> :
              !userProfile?.username ? <UsernameSetup /> :
                <Home />
          }
        />

        <Route
          path="/chat/:conversationId"
          element={currentUser ? <Home /> : <Navigate to="/" />}
        />

        <Route
          path="/profile/:username"
          element={currentUser ? <Home /> : <Navigate to="/" />}
        />


      </Routes>
    </BrowserRouter>
  )
}

export default App



