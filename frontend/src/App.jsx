import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Home/Dashboard'
import InterviewPrep from './pages/InterviewPrep/InterviewPrep'
import { Toaster } from "react-hot-toast"
import { UserContext } from "./context/userContext"
import VerifyEmail from './pages/VerifyEmail/VerifyEmail'

function App() {
  const { user } = useContext(UserContext)

  return (
    <div >
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />

          {user && <Route path='/dashboard' element={<Dashboard />} />}
          {user && <Route path='/interview-prep/:sessionId' element={<InterviewPrep />} />}

          <Route path='/verify-email' element={<VerifyEmail />} />
        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "12px",

          }
        }}
      />
    </div>
  )
}

export default App