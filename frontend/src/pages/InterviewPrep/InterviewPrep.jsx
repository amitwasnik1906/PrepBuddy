import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/Layouts/DashboardLayout'
import { 
  LucideArrowLeft, 
  LucidePin, 
  LucideMessageCircle, 
  LucideChevronDown, 
  LucideChevronUp,
  LucideUser,
  LucideTarget,
  LucideCalendar,
  LucideFileText
} from 'lucide-react'

function InterviewPrep() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState({})

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId))
      setSession(response.data.data.session)
    } catch (error) {
      toast.error('Failed to fetch session')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handlePinQuestion = async (questionId) => {
    try {
      // Add your pin API call here
      await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId))
      await fetchSession() // Refresh session data to get updated pin status
      toast.success('Question pinned successfully')
    } catch (error) {
      toast.error('Failed to pin question')
    }
  }

  const handleExplainQuestion = (questionId) => {
    // Add your explain functionality here
    
    toast.success('Explain feature coming soon')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500">Session not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <LucideArrowLeft size={20} />
            Back to Sessions
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-start gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold">
                {session.role.split(' ').map(word => word[0]).join('').toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.role}</h1>
                <p className="text-gray-600 mb-4">{session.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <LucideUser size={18} className="text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience</p>
                      <p className="text-sm text-gray-600">{session.experience} years</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <LucideTarget size={18} className="text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Focus Areas</p>
                      <p className="text-sm text-gray-600">{session.topicsToFocus}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <LucideFileText size={18} className="text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Questions</p>
                      <p className="text-sm text-gray-600">{session.questions.length} prepared</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview Questions</h2>
          
          {session.questions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  
                  <button
                    onClick={() => toggleQuestion(question._id)}
                    className="flex-1 text-left"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {question.question}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Click to {expandedQuestions[question._id] ? 'hide' : 'view'} answer
                    </p>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePinQuestion(question._id)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        question.isPinned 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Pin question"
                    >
                      <LucidePin size={18} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExplainQuestion(question._id)
                      }}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      title="Get explanation"
                    >
                      <LucideMessageCircle size={18} />
                    </button>
                    
                    <button
                      onClick={() => toggleQuestion(question._id)}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      {expandedQuestions[question._id] ? (
                        <LucideChevronUp size={18} />
                      ) : (
                        <LucideChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              {expandedQuestions[question._id] && (
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <LucideMessageCircle size={20} className="text-blue-500" />
                      Answer
                    </h4>
                    <div className="prose max-w-none">
                      <div 
                        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: question.answer.replace(/\n/g, '<br/>').replace(/\*(.*?)\*/g, '<strong>$1</strong>') 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Practice Complete!</h3>
            <p className="text-purple-100 mb-4">
              You've reviewed {session.questions.length} questions for your {session.role} interview preparation.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border border-purple-400"
              >
                Generate more questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InterviewPrep