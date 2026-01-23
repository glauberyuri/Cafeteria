import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { Toaster } from "sonner";
import NotFound from "./pages/NotFound";
import './global.css'
import PrivateRoute from "@/routes/PrivateRoute"
import Dashboard from "./pages/Dashboard";
import SectorsPage from "./pages/Sectors";
import DietPage from "./pages/DietPage";

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
              <Dashboard />
              </PrivateRoute>
            }
          />  
          <Route
            path="/sectors"
            element={
              <PrivateRoute>
                <SectorsPage />
              </PrivateRoute>
            }
          />  
          <Route
            path="/diet_type"
            element={
              <PrivateRoute>
                <DietPage />
              </PrivateRoute>
            }
          />  
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App
