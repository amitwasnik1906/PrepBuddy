import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Home/Dashboard'
import InterviewPrep from './pages/InterviewPrep/InterviewPrep'
import { Toaster } from "react-hot-toast"
import UserProvider from "./context/userContext"
import VerifyEmail from './pages/VerifyEmail/VerifyEmail'

function App() {
  return (
    <UserProvider>
      <div >
        <Router>
          <Routes>
            <Route path='/' element={<LandingPage />} />

            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/interview-prep/:sessionId' element={<InterviewPrep />} />

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
    </UserProvider>
  )
}

export default App