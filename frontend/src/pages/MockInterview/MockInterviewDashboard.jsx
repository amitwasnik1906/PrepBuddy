import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/Layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LucidePlus } from 'lucide-react'
import Modal from "../../components/modal/Modal"
import DeleteAlertContent from '../../components/content/DeleteAlertContent'
import CreateInterviewForm from './CreateInterviewForm'
import InterviewCard from '../../components/Cards/InterviewCard'

function MockInterviewDashboard() {
  const navigate = useNavigate()

  const [openCreateModel, setOpenCreateModel] = useState(false)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(false)

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null
  })

  const deleteInterview = async (interviewData) => {
    try {
      // api request to delete

      
      toast.success('interview deleted successfully')
      setOpenDeleteAlert({ open: false, data: null })
      fetchAllSessions()
    } catch (error) {
      toast.error('Failed to delete interview')
      console.error(error)
    }
  }

  const fetchAllInterview = async () => {
    try {
      // api request to fetch all interviews
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.INTERVIEW.GET_ALL);
      console.log(res.data);

      setInterviews(res.data?.data.interviews || []);

    } catch (error) {
      toast.error('Failed to fetch Interview')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllInterview()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.length === 0 ?
              <div className="col-span-full text-center py-12 ">
                <div className="text-gray-500 text-lg mb-4">No Past Interview available</div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setOpenCreateModel(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer text-sm sm:text-base flex items-center gap-2"
                  >
                    <LucidePlus className="w-5 h-5" /> Give your first mock Interview
                  </button>
                </div>
              </div>
              :
              interviews?.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  onSelect={() => {
                    navigate(`/interview/${interview._id}`)                   
                  }}
                  onDelete={() => {
                    setOpenDeleteAlert({ open: true, data: interview })
                  }}

                />
              ))}
          </div>
        )}

        <button
          className=' cursor-pointer fixed bottom-6 right-6 bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2'
          onClick={() => setOpenCreateModel(true)}
        >
          <LucidePlus /> Add New
        </button>

      </div>

      <Modal
        isOpen={openCreateModel}
        onClose={() => {
          setOpenCreateModel(false)
        }}

      >
        <CreateInterviewForm />
      </Modal>

      {/* <Modal
        isOpen={openDeleteAlert.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null })
        }}
        hideHeader
      >
        <DeleteAlertContent
          content="Are you sure you want to delete this session?"
          onDelete={() => {
            deleteSession(openDeleteAlert.data)
          }}

          onCancel={() => {
            setOpenDeleteAlert({ open: false, data: null })
          }}
        />
      </Modal> */}

    </DashboardLayout>
  )
}

export default MockInterviewDashboard