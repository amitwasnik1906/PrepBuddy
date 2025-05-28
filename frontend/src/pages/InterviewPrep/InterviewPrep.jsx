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
import AiResponseCard from '../../components/Cards/AiResponseCard'
import Explanation from './Explanation'
import Drawer from '../../components/modal/Drawer'
import ExplanationSkeletonLoader from '../../components/Loaders/ExplanationSkeletonLoader'

function InterviewPrep() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [animatingQuestions, setAnimatingQuestions] = useState(new Set())

  const [explanationQuestionSelected, setExplanationQuestionSelected] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [explanationLoading, setExplanationLoading] = useState(false)
  const [openExplainModal, setOpenExplainModal] = useState(false)

  const [loadQuestionsLoading, setLoadQuestionsLoading] = useState(false)


  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId))
      let session = response.data.data.session

      setSession(session)
    } catch (error) {
      toast.error('Failed to fetch session')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Sort questions: pinned first, then by updatedAt (most recent first)
  const sortedQuestions = session?.questions ? [...session.questions].sort((a, b) => {
    // First priority: pinned status
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    // Second priority: most recently updated first
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  }) : []

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handlePinQuestion = async (questionId) => {
    try {
      // Add animation class
      setAnimatingQuestions(prev => new Set([...prev, questionId]))

      await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId))

      // Wait for animation to complete before updating data
      setTimeout(async () => {
        await fetchSession() // Refresh session data to get updated pin status
        setAnimatingQuestions(prev => {
          const newSet = new Set(prev)
          newSet.delete(questionId)
          return newSet
        })
        toast.success('Question pinned successfully')
      }, 800) // Animation duration

    } catch (error) {
      setAnimatingQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
      toast.error('Failed to pin question')
    }
  }

  const handleExplainQuestion = async (question) => {
    // Add your explain functionality here
    try {
      setExplanationLoading(true)
      setOpenExplainModal(true)
      setExplanationQuestionSelected(question)

      // api call generate-explaination
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_EXPLAINATION, {
        question: question
      })

      if (response.data.success) {
        setExplanation(response.data.data.explanation)
      }

      // // Simulate loading for 5 seconds
      // await new Promise(resolve => setTimeout(resolve, 3000))
      // const explanation = {
      //   "title": "Styling React Components: A Beginner's Guide",
      //   "explanation": "The question \"What are the different ways to style components in React?\" is fundamental to understanding how to visually customize your React applications. React itself doesn't dictate a specific styling method; instead, it provides flexibility, allowing developers to choose approaches that suit their project's needs and preferences. Here's a breakdown of common methods:\n\n1.  **Inline Styles:** This is the most basic method. You directly apply styles to an element within the component's JSX using the `style` attribute. The value of `style` is a JavaScript object where keys are CSS properties (e.g., `color`, `fontSize`) and values are their corresponding values. While easy for simple styling, inline styles become cumbersome and less maintainable for more complex designs.\n\n    ```javascript\n    function MyComponent() {\n      return (\n        <div style={{ color: 'blue', fontSize: '16px' }}>\n          Hello, React!\n        </div>\n      );\n    }\n    ```\n\n2.  **CSS Stylesheets (External Stylesheets):** This is the most common and recommended approach for larger projects. You create separate `.css` files and import them into your React components. This separation of concerns makes your code cleaner and easier to maintain. It allows you to leverage the full power of CSS, including selectors, media queries, and more.\n\n    ```javascript\n    // MyComponent.jsx\n    import './MyComponent.css';\n\n    function MyComponent() {\n      return <div className=\"my-component\">Hello, React!</div>;\n    }\n\n    // MyComponent.css\n    .my-component {\n      color: blue;\n      font-size: 16px;\n    }\n    ```\n\n3.  **CSS Modules:** CSS Modules provide a more scoped approach to CSS. They automatically generate unique class names for your CSS rules, preventing naming conflicts. This enhances modularity and avoids unintentional style overrides. The import of a CSS Module gives you an object whose properties are the locally scoped class names.\n\n    ```javascript\n    // MyComponent.jsx\n    import styles from './MyComponent.module.css';\n\n    function MyComponent() {\n      return <div className={styles.myComponent}>Hello, React!</div>;\n    }\n\n    // MyComponent.module.css\n    .myComponent {\n      color: blue;\n      font-size: 16px;\n    }\n    ```\n\n4.  **Styled Components:** Styled Components is a popular library that allows you to write CSS directly within your JavaScript files. It utilizes tagged template literals to create React components with attached styles. This approach offers better encapsulation and component-level styling, promoting reusability and readability.\n\n    ```javascript\n    import styled from 'styled-components';\n\n    const StyledDiv = styled.div`\n      color: blue;\n      font-size: 16px;\n    `;\n\n    function MyComponent() {\n      return <StyledDiv>Hello, React!</StyledDiv>;\n    }\n    ```\n\n5.  **Other CSS-in-JS Libraries:** Similar to Styled Components, other libraries like Emotion offer alternative solutions for styling components using JavaScript. They often provide similar features and advantages, allowing you to choose based on preference and project needs.\n\n6. **Inline Styles with Variables:** You can use JavaScript variables within inline styles to make them more dynamic. However, it's still generally less maintainable than CSS stylesheets.\n\nChoosing the right method depends on the project's size, complexity, and your personal preferences. For most projects, a combination of CSS stylesheets (for global styles and theming) and CSS Modules or Styled Components (for component-specific styles) is a good practice."
      // }
      // setExplanation(explanation)

      toast.success('Explanation generated successfully')

    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message)
      }
      else {
        toast.error("Something went wrong. Try again")
      }
    } finally {
      setExplanationLoading(false)
    }
  }

  const handleAddQuestionsToSession = async () => {
    try {
      setLoadQuestionsLoading(true)

      // api call to generate questions
      const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTION, {
        role: session.role,
        experience: session.experience,
        topicsToFocus: session.topicsToFocus,
        numberOfQuestions: 5
      })

      const questions = aiResponse.data.data.interviewQuestions

      // Simulate loading for 5 seconds
      // await new Promise(resolve => setTimeout(resolve, 3000))
      // const questions = [
      //   {
      //     "_id": "6835ff3823dd3cee49ffb8fd",
      //     "session": "6835ff3823dd3cee49ffb8f7",
      //     "question": "What are React Hooks? Give some examples and why are they useful?",
      //     "answer": "React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8. They provide a more concise way to manage state and side effects, replacing the need for class components in many cases.\n\n*   **`useState`**:  Allows you to add state to functional components.\n*   **`useEffect`**:  Allows you to perform side effects (e.g., data fetching, setting up subscriptions) in functional components.\n*   **`useContext`**:  Provides a way to access the context API.\n\n```javascript\nimport React, { useState, useEffect } from 'react';\n\nfunction MyComponent() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = `Count: ${count}`;\n  }, [count]); // Runs effect after every re-render when 'count' changes.\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n```",
      //     "isPinned": false,
      //     "createdAt": "2025-05-27T18:06:48.673Z",
      //     "updatedAt": "2025-05-28T05:52:11.559Z",
      //     "__v": 0
      //   },
      //   {
      //     "_id": "6835ff3823dd3cee49ffb8fe",
      //     "session": "6835ff3823dd3cee49ffb8f7",
      //     "question": "Explain event handling in React. How is it different from standard HTML event handling?",
      //     "answer": "In React, event handling is slightly different than in standard HTML.\n\n*   **Event names:** React event names are written in camelCase (e.g., `onClick`, `onChange`) instead of lowercase.\n*   **Event handlers:** You pass a function as the event handler (e.g., `onClick={handleClick}`).\n*   **Event delegation:** React uses event delegation to handle events more efficiently. Events are attached to the root of the document, and React then routes them to the appropriate components.\n\n```javascript\nfunction handleClick() {\n  alert('Button clicked!');\n}\n\nreturn <button onClick={handleClick}>Click me</button>;\n```",
      //     "isPinned": false,
      //     "createdAt": "2025-05-27T18:06:48.673Z",
      //     "updatedAt": "2025-05-28T07:54:33.994Z",
      //     "__v": 0
      //   }
      // ]

      // api call to add questions to session
      const response = await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION, {
        sessionId: session._id,
        questions: questions
      })

      if (response.data.success) {
        setSession(prev => ({
          ...prev,
          questions: [...prev.questions, ...questions]
        }))
        toast.success('Added more questions successfully')
      }

    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message)
      }
      else {
        toast.error("Something went wrong. Try again")
      }
    }
    finally {
      setLoadQuestionsLoading(false)
    }
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

          {sortedQuestions.map((question, index) => {
            const isAnimating = animatingQuestions.has(question._id)
            const isPinned = question.isPinned

            return (
              <div
                key={question._id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ease-in-out ${isPinned
                  ? 'border-yellow-200 shadow-lg ring-2 ring-yellow-100'
                  : 'border-gray-100'
                  } ${isAnimating
                    ? 'transform scale-105 shadow-xl ring-4 ring-yellow-200'
                    : ''
                  }`}
                style={{
                  transform: isAnimating ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >

                {/* Question Header */}
                <div className={`flex items-center justify-between p-6 ${isPinned ? 'bg-yellow-50' : 'bg-gray-50'} border-b border-gray-100`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${isPinned
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-purple-100 text-purple-600'
                      }`}>
                      {index + 1}
                    </div>

                    <button
                      onClick={() => toggleQuestion(question._id)}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
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
                        disabled={isAnimating}
                        className={`p-2 rounded-lg transition-all duration-200 ${isPinned
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } ${isAnimating ? 'animate-pulse' : ''
                          }`}
                        title={isPinned ? "Unpin question" : "Pin question"}
                      >
                        <LucidePin
                          size={18}
                          className={`transition-transform duration-200 ${isAnimating ? 'rotate-12' : ''
                            }`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExplainQuestion(question.question)
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
                  <div className="">
                    <div
                      className={`rounded-lg p-6 ${isPinned
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50'
                        : 'bg-white border border-gray-200'
                        }`}
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <LucideMessageCircle size={20} className={isPinned ? 'text-yellow-600' : 'text-blue-500'} />
                        Answer
                      </h4>

                      <AiResponseCard
                        text={question.answer}
                      />

                    </div>
                  </div>
                )}


              </div>
            )
          })}
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
                onClick={() => handleAddQuestionsToSession()}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors border border-purple-400 cursor-pointer flex items-center gap-2"
                disabled={loadQuestionsLoading}
              >
                {loadQuestionsLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  'Load more questions'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={openExplainModal}
        onClose={() => {
          setOpenExplainModal(false)
        }}
        hideHeader
      >
        {explanationLoading ? <ExplanationSkeletonLoader /> :
          <Explanation
            explanation={explanation}
            question={explanationQuestionSelected}
          />
        }
      </Drawer>
    </DashboardLayout>
  )
}

export default InterviewPrep