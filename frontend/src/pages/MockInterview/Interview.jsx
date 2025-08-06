import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, Send } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const AIMockInterview = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [agentState, setAgentState] = useState('idle'); // idle, speaking, listening, thinking
  const [interviewEnded, setInterviewEnded] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const navigate = useNavigate()
  const { interviewId } = useParams()
  const [interviewDetails, setInterviewDetails] = useState({});

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setAgentState('listening');
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log(userResponse);
        console.log(transcript);

        setUserResponse(prev => (prev + " " + transcript));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (agentState === 'listening') {
          setAgentState('thinking');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setAgentState('idle');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(()=>{
    console.log(agentState);
  }, [agentState])

  useEffect(() => {
    async function getInterviewDetails() {
      try {
        const response = await axiosInstance.get(API_PATHS.INTERVIEW.GET_ONE(interviewId))
        setInterviewDetails(response.data.data.interview)
        console.log(response.data.data.interview);

      } catch (error) {
        console.log(error);

      }
    }

    getInterviewDetails()
  }, [interviewId])

  const speakQuestion = (question) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setAgentState('speaking');
      };

      utterance.onend = () => {
        setAgentState('idle');
      };

      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const startInterview = async () => {
    try {
      setInterviewStarted(true);
      setAgentState('thinking');
      setIsProcessing(true)

      // Start the interview
      await new Promise(resolve => setTimeout(resolve, 1000));
      const firstQuestion = interviewDetails.interviewHistory[1].parts[0].text

      setCurrentQuestion(firstQuestion);
      setQuestionCount(1);
      speakQuestion(firstQuestion);
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsProcessing(false)
    }
  };

  const submitAnswer = async () => {
    try {
      setIsProcessing(true)

      const response = await axiosInstance.post(API_PATHS.INTERVIEW.SUBMIT_ANSWER(interviewId), { answer: userResponse })

      const nextQuestion = response.data.data.nextQuestion

      // if interview Ended
      if (nextQuestion === "END") {
        setCurrentQuestion("");
        setUserResponse("")

        speakQuestion("Alright, that brings us to the end of our interview today. Thank you for your time. Please review the feedback provided");

        await new Promise(resolve => setTimeout(resolve, 15000));

        setInterviewEnded(true)
        
        return
      }

      setCurrentQuestion(nextQuestion);
      speakQuestion(nextQuestion);
      setUserResponse("")
      setQuestionCount(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsProcessing(false)
    }
  }

  const getAgentAnimation = () => {
    switch (agentState) {
      case 'speaking':
        return 'animate-pulse bg-blue-500';
      case 'listening':
        return 'animate-bounce bg-green-500';
      case 'thinking':
        return 'animate-spin bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getAgentExpression = () => {
    switch (agentState) {
      case 'speaking':
        return '😊';
      case 'listening':
        return '👂';
      case 'thinking':
        return '🤔';
      default:
        return '😐';
    }
  };

  // If interview has ended, show a page with a button to go to feedback page
  if (interviewEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2 text-center">Interview Completed!</h2>
          <p className="text-gray-700 mb-6 text-center">
            Thank you for participating in the mock interview.<br />
            You can now view your feedback.
          </p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
            onClick={() => {
              navigate(`/interview/:${interviewId}`)
            }}
          >
            View Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold text-center">AI Mock Interview</h1>
          <p className="text-center mt-2 text-indigo-100">Practice your interview skills with Alex</p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* AI Agent */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-32 h-32 rounded-full ${getAgentAnimation()} flex items-center justify-center mb-4 transition-all duration-300`}>
              <div className="text-6xl">{getAgentExpression()}</div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Alex - AI Interviewer</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${agentState === 'idle' ? 'bg-gray-400' : agentState === 'speaking' ? 'bg-blue-500 animate-pulse' : agentState === 'listening' ? 'bg-green-500 animate-bounce' : 'bg-yellow-500 animate-spin'}`}></div>
              <span className="text-sm text-gray-600 capitalize">{agentState === 'idle' ? 'Ready' : agentState}</span>
            </div>
          </div>

          {/* Question Display */}
          {interviewStarted && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">Q</span>
                </div>
                <div className="flex-1">
                  {
                    agentState === 'thinking' ? <div className="text-gray-600 text-lg">Thinking...</div> :
                      <p className="text-gray-800 leading-relaxed text-lg">{currentQuestion}</p>
                  }
                </div>
              </div>
            </div>
          )}

          {/* User Response Area */}
          {interviewStarted && (
            <div className="bg-green-50 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div className="flex-1">
                  <textarea
                    className="text-gray-800 leading-relaxed min-h-[60px] w-full bg-transparent border-none  focus:ring-0 resize-none"
                    value={userResponse}
                    onChange={e => setUserResponse(e.target.value)}
                    placeholder="Your response will appear here..."
                    disabled={isProcessing}
                  />
                  {isProcessing && (
                    <span className="italic text-gray-500">Processing your response...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {!interviewStarted ? (
              <button
                onClick={startInterview}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105"
              >
                <Play size={20} />
                <span>Start Interview</span>
              </button>
            ) : (
              <>
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || agentState === 'speaking' || agentState === 'thinking'}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  <span>{isListening ? 'Stop Recording' : 'Start Recording'}</span>
                </button>

                <button
                  onClick={() => speakQuestion(currentQuestion)}
                  disabled={isProcessing || agentState === 'speaking' || agentState === 'thinking'}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  <span>Repeat Question</span>
                </button>

                <button
                  onClick={() => submitAnswer()}
                  disabled={userResponse.length === 0 || isProcessing || agentState === 'speaking' || agentState === 'thinking'}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  <span>Submit Answer</span>
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click "Start Interview" to begin</li>
              <li>• Listen to Alex's question (you can repeat it anytime)</li>
              <li>• Click "Start Recording" to give your answer</li>
              <li>• Speak clearly and click "Stop Recording" when done</li>
              <li>• Alex will process your response and ask the next question</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMockInterview;