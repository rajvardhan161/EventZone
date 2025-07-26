import { createContext, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const AdminContext = createContext()

const AdminContextProvider = (props) =>{
    const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'')
   const [organizer, setOrganizer] = useState(localStorage.getItem('organizer')?localStorage.getItem('organizer'):'')
    const [dashData, setDashData] = useState(false)
    
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null);


    const backendUrl= import.meta.env.VITE_BACKEND_URL
     
 
 
    
    
    

    const value = {
        token,setToken,dashData,setDashData,backendUrl,setOrganizer,organizer,setUserType,
    }
    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider