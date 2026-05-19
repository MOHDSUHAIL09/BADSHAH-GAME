import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard';
import Header from '../components/gaming-dashboard/common/Header';
import Withdraw from '../pages/dashboard/withdraw/Withdraw';
import WithdrawReport from '../pages/dashboard/withdraw/WithdrawReport';

function DashboardLayout() {
  return (
    <>
    <div className="game-container ">
      <Header/>
     
    <div className="main-content">
    
      <Routes>
        <Route index element={<Dashboard/>} />
        <Route path='/withdraw' element={<Withdraw/>} />
        <Route path='/withdrawreport' element={<WithdrawReport/>} />
      </Routes>
    </div>
     </div>
    </>
  );
}

export default DashboardLayout;