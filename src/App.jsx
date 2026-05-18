import { Routes, Route } from 'react-router-dom';
import { useUser } from './context/UserContext';
import DashboardLayout from './Layout/DashboardLayout';
import LandingLayout from './Layout/LandingLayout';

const App = () => {
  const { user } = useUser();

  return (
    <Routes>
      <Route path="/*" element={<LandingLayout/>} />
      <Route 
        path="/dashboard/*" 
        element={user ? <DashboardLayout/> : <LandingLayout/>} 
      />
    </Routes>
  );
};

export default App;