import React, { createContext, useState, useEffect } from "react"
import axiosInstance from "../utils/axiosInstance"
import { API_PATHS } from "../utils/apiPaths"

export const UserContext = createContext()

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) return

        const accessToken = localStorage.getItem("token")
        if (!accessToken) {
            setLoading(false)
            return
        }

        const featchUser = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE)
                setUser(response.data.data)
                // console.log(response.data.data);
                
            } catch (error) {
                console.error("User not authenticated", error)
                clearUser()
            }
            finally {
                setLoading(false)
            }
        }

        featchUser()

    }, [])

    const updateUser = (userDate) => {
        setUser(userDate)
        localStorage.setItem("token", userDate.token) 
        setLoading(false)
    }

    const clearUser = () => {
        setUser(null)
        localStorage.removeItem("token")
    }

    return (
        <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider