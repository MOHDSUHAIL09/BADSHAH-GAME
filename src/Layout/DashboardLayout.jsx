import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard';
import Header from '../components/gaming-dashboard/common/Header';
import Withdraw from '../pages/dashboard/withdraw/Withdraw';
import WithdrawReport from '../pages/dashboard/withdraw/WithdrawReport';
import Referral from '../pages/dashboard/referral/Referral';
import Profile from '../pages/dashboard/profile/profile/Profile';
import AddFund from '../pages/dashboard/addfund/AddFund';

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
        <Route path='/referral' element={<Referral/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/addfund' element={<AddFund/>} />
      </Routes>
    </div>
     </div>
    </>
  );
}

export default DashboardLayout;