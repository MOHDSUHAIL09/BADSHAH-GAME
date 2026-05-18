import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import '../assets/Main.css'

function DashboardLayout() {
  return (
    <div className="main-content">
      <Routes>
        <Route index element={<Dashboard/>} />
      </Routes>
    </div>
  );
}

export default DashboardLayout;