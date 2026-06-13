import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeForm from './pages/Employees/EmployeeForm';
import InternList from './pages/Interns/InternList';
import InternForm from './pages/Interns/InternForm';
import AttendancePage from './pages/Attendance/AttendancePage';
import TaskList from './pages/Tasks/TaskList';
import PlacementPage from './pages/Placements/PlacementPage';
import DepartmentPage from './pages/Departments/DepartmentPage';
import Spinner from './components/ui/Spinner';
import ResumePage  from './pages/Resumes/ResumePage';
import ReportsPage from './pages/Reports/ReportsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import UserProfileView from './pages/Profile/UserProfileView';


function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  return user ? children : <Navigate to="/login" />;
  
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="employees"   element={<EmployeeList />} />
        <Route path="employees/new"  element={<EmployeeForm />} />
        <Route path="employees/:id"  element={<EmployeeForm />} />
        <Route path="interns"     element={<InternList />} />
        <Route path="interns/new"    element={<InternForm />} />
        <Route path="interns/:id"    element={<InternForm />} />
        <Route path="attendance"  element={<AttendancePage />} />
        <Route path="tasks"       element={<TaskList />} />
        <Route path="placements"  element={<PlacementPage />} />
        <Route path="departments" element={<DepartmentPage />} />
        <Route path="resumes" element={<ResumePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} /> 
        <Route path="user-profile/:id" element={<UserProfileView />} />
      </Route>
    </Routes>
  );
}