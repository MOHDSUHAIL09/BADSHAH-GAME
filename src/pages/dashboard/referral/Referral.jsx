import React, { useState, useEffect } from 'react';
import { FaGift, FaCopy } from 'react-icons/fa';
import CustomTable from '../../../components/ui/CustomTable';
import Pagination from '../../../components/ui/Pagination';
import apiClient from '../../../api/apiClient';
import './Referral.css';

const Referral = () => {
  const [downlineData, setDownlineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalReferral, setTotalReferral] = useState(0);
  const [totalBonus, setTotalBonus] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [referralLink, setReferralLink] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const getAuthToken = () => localStorage.getItem('token') || '';
  
  const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const showToastMessage = (message, isSuccess = true) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch Downline Team
  const fetchDownlineTeam = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const userData = getUserData();
      const mregno = userData?.id ;

      const requestBody = {
        mregno: Number(mregno),
        type: 0,
        findlvl: 0,
        pageIndex: 1,
        pageSize: 10
      };

      const response = await apiClient.post('/Dashboard/downline-team', requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.success) {
        const data = response.data.data?.data || [];
        setDownlineData(data);
        setTotalReferral(response.data.data?.totalDirect || 0);
        setTotalBonus(response.data.data?.referralIncome || 0);
        setReferralLink(`WWW.BADSHAH/Signup?ref=${userData?.loginid || 'BETID'}`);
      } else {
        showToastMessage(response.data?.message || 'Failed to fetch downline data', false);
      }
    } catch (error) {
      console.error('Error fetching downline:', error);
      showToastMessage('Failed to load downline team data', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownlineTeam();
  }, []);

  // Copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToastMessage('Referral link copied!', true);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = downlineData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(downlineData.length / itemsPerPage);

  // Table Columns
  const columns = ['S.No', 'Login ID', 'Name', 'Joining Date'];

  return (
    <div className='container'>
      {/* Toast Message */}
      {showToast && (
        <div className="custom-toast">
          <div className="toast-content">{toastMessage}</div>
        </div>
      )}
      
      <div className="referral-page">
        <div className="referral-container">
          
          {/* Header */}
          <div className="referral-header">
            <h2>Referral Link</h2>
            <FaGift className="gift-icon" />
          </div>
          
          <div className="referral-body">
            {/* Referral Link Box */}
            <div className="referral-card referral-link-card">
              <h3>Your Referral Link</h3>
              <div className="referral-link-box">
                <FaGift className="card-icon" />
                <p className="referral-link">{referralLink || 'Loading...'}</p>
                <button className="copy-btn" onClick={handleCopyLink} disabled={!referralLink}>
                  <FaCopy />
                </button>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className="referral-grid">
              {/* Total Referral */}
              <div className="referral-card">
                <h3>Total Referral Id</h3>
                <div className="card-value">
                  <FaGift className="card-icon" />
                  <span>{totalReferral}</span>
                </div>
              </div>

              {/* Total Bonus */}
              <div className="referral-card">
                <h3>Total Referral Bonus</h3>
                <div className="card-value">
                  <FaGift className="card-icon" />
                  <span>₹{totalBonus.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Downline Team Table */}
            <div className="downline-table-section mt-4">
              <h3 className="mb-3" style={{ color: '#ffd700', fontSize: '1.2rem' }}>
                <i className="bi bi-people-fill me-2"></i>
                Downline Team ({totalReferral})
              </h3>
              
              <CustomTable 
                columns={columns} 
                loading={loading}
                emptyMessage="No downline members found"
              >
                {currentItems.map((member, index) => (
                  <tr key={member.loginid || index}>
                    <td className="py-3 px-4" style={{ color: '#fff', borderBottom: '1px solid #2d3748' }}>
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#ffd700', borderBottom: '1px solid #2d3748' }}>
                      {member.loginid || '-'}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#fff', borderBottom: '1px solid #2d3748' }}>
                      {member.fname || '-'}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#fff', borderBottom: '1px solid #2d3748' }}>
                      {member.regdate || '-'}
                    </td>
                  </tr>
                ))}
              </CustomTable>

              {/* Pagination */}
              {downlineData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={downlineData.length}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;