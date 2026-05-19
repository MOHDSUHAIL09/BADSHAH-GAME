import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard';
import Header from '../components/gaming-dashboard/common/Header';

function DashboardLayout() {
  return (
    <>
    <div className="game-container ">
      <Header/>
     
    <div className="main-content">
    
      <Routes>
        <Route index element={<Dashboard/>} />
      </Routes>
    </div>
     </div>
    </>
  );
}

export default DashboardLayout;