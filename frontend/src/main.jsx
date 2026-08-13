import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/Index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"    //BrowserRouter gives the ability to change components rendered on screen based on the /url
import { MovieProvider } from './context/MovieContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*BrowserRouter enables client-side routes; MovieProvider shares favorites across those routes.*/}
    <BrowserRouter>
      <MovieProvider>
        <App />
      </MovieProvider>
    </BrowserRouter>
  </StrictMode>,
)
