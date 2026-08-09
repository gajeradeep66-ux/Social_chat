import axios from 'axios'

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'https://social-chat-backend-2.onrender.com/api' : '/api',
    withCredentials: true, 
})