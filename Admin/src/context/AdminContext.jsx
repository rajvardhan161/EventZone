import { createContext, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const AdminContext = createContext()

const AdminContextProvider = (props) =>{
    const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'')
   
    const [dashData, setDashData] = useState(false)
    


    const backendUrl= import.meta.env.VITE_BACKEND_URL
     
 
 
    
    
    

    const value = {
        token,setToken,dashData,setDashData,backendUrl,
    }
    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider