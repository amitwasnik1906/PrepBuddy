import React, { useContext } from 'react'
import ProfileInfoCard from '../Cards/ProfileInfoCard'
import { Link } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import { Target } from 'lucide-react'

function Navbar() {
    const { user } = useContext(UserContext)
    return (
        <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <Link to='/'>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                PrepBuddy
                            </span>
                        </Link>
                    </div>

                    <div>
                        <ProfileInfoCard />
                    </div>

                </div>
            </div>

        </nav>
    )
}

export default Navbar