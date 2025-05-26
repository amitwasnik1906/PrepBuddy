import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from "./pages/Auth/Login"
import SignUp from './pages/Auth/SignUp'
import Dashboard from './pages/Home/Dashboard'
import InterviewPrep from './pages/InterviewPrep/InterviewPrep'
import {Toaster} from "react-hot-toast"

function App() {
  return (
    <div >
      <Router>
        <Routes>
          <Route path='/' element= {<LandingPage/>}/>

          <Route path='/login' element= {<Login/>}/>
          <Route path='/signup' element= {<SignUp/>}/>

          <Route path='/dashboard' element= {<Dashboard/>}/>
          <Route path='/interview-prep/:sessionId' element= {<InterviewPrep/>}/>
        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style:{
            fontSize: "12px",
            
          }
        }}
      />
      
    </div>
  )
}

export default App