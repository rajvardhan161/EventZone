import { createContext, useState ,useEffect} from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const OrgsnizerContext = createContext()

const OrgsnizerContextProvider = (props) =>{

       const [organizer, setOrganizer] = useState(localStorage.getItem('organizer')?localStorage.getItem('organizer'):'')

           const backendUrl= import.meta.env.VITE_BACKEND_URL
 useEffect(() => {
    if (organizer && organizer.trim() !== '') {
      localStorage.setItem('organizer', organizer);
    } else {
      localStorage.removeItem('organizer');
    }
  }, [organizer]);


  const value = {
    organizer,setOrganizer,backendUrl,
  }


  return (
          <OrgsnizerContext.Provider value={value}>
              {props.children}
          </OrgsnizerContext.Provider>
      )
}


export default OrgsnizerContextProvider