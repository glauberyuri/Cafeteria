import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { Toaster } from "sonner";
import NotFound from "./pages/NotFound";
import './global.css'
import PrivateRoute from "@/routes/PrivateRoute"
import Dashboard from "./pages/Dashboard";
import SectorsPage from "./pages/Sectors";
import DietPage from "./pages/DietPage";
import Collaborators from "./pages/Collaborators";
import { CollaboratorProvider } from "./contexts/CollaboratorContext";
import StudentApproval from "./pages/StudentApproval";
import WeeklyMenu from "./pages/WeeklyMenu";
import { KioskProvider } from "./contexts/KioskContext";
import { ReportProvider } from "./contexts/MealReportContext";
import PublicKiosk from "./pages/PublicKiosk";
import Settings from "./pages/Settings";
import { MealsProvider } from "./contexts/MealsContext";
import Meals from "./pages/Meals"
import Reports from "./pages/Reports";

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
          <Route
            path="/weekly-menu"
            element={
              <PrivateRoute>
                <WeeklyMenu />
              </PrivateRoute>
            }
          /> 
          <Route
            path="/Collaborators"
            element={
              <PrivateRoute>
                <CollaboratorProvider>
                  <Collaborators />
                </CollaboratorProvider>
              </PrivateRoute>
            }
          />   
          <Route
            path="/student-approval"
            element={
              <PrivateRoute>
                  <StudentApproval />
              </PrivateRoute>
            }
          /> 
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                  <Settings />
              </PrivateRoute>
            }
          />    
          <Route
            path="/kiosk"
            element={
              <KioskProvider>
                <PublicKiosk />
              </KioskProvider>
            }
          />  
          <Route
            path="/meals"
            element={
              <MealsProvider>
                <Meals />
              </MealsProvider>
            }
          />  
          <Route
            path="/reports"
            element={
                <PrivateRoute>
                  <ReportProvider>
                    <Reports />
                  </ReportProvider>
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
