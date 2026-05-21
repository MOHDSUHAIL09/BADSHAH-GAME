import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './Profile.css';
import { FaGift } from 'react-icons/fa';
import apiClient from '../../../../api/apiClient';
import { useUser } from '../../../../context/UserContext';

const Profile = () => {
  const { user, token } = useUser(); // Context se user data lo
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [profileData, setProfileData] = useState({
    name: '',
    mobile: '',
    email: '',
    upiId: '',
    accountNo: '',
    ifsc: '',
    holderName: '',
    branch: '',
    qrImage: null
  });

  // ✅ Load Profile Data from API
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await apiClient.get('/User/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        setProfileData({
          name: userData.profilename || userData.name || '',
          mobile: userData.mobile || '',
          email: userData.email || '',
          upiId: userData.upiId || userData.upiid || '',
          accountNo: userData.Accountno || userData.accountNo || '',
          ifsc: userData.Ifsccode || userData.ifsc || '',
          holderName: userData.holdername || userData.holderName || '',
          branch: userData.branch || '',
          qrImage: null
        });
        
        // Agar payment method saved hai to set karo
        if (userData.paymentMethod) {
          setPaymentMethod(userData.paymentMethod);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setProfileData(prev => ({
        ...prev,
        qrImage: file
      }));
      toast.success('QR code uploaded successfully');
    }
  };

  // ✅ Update Profile API Call
  const handleUpdateProfile = async () => {
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', profileData.name);
      formDataToSend.append('email', profileData.email);
      formDataToSend.append('mobile', profileData.mobile);
      formDataToSend.append('paymentMethod', paymentMethod);
      
      if (paymentMethod === 'UPI') {
        formDataToSend.append('upiId', profileData.upiId);
        if (profileData.qrImage) {
          formDataToSend.append('qrImage', profileData.qrImage);
        }
      } else {
        formDataToSend.append('accountNo', profileData.accountNo);
        formDataToSend.append('ifsc', profileData.ifsc);
        formDataToSend.append('holderName', profileData.holderName);
        formDataToSend.append('branch', profileData.branch);
      }
      
      const response = await apiClient.put('/User/update-profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        // Refresh profile data
        fetchProfileData();
      } else {
        toast.error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            zIndex: 999999,
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 20px',
          },
        }}
        containerStyle={{
          zIndex: 999999,
        }}
      />

      <div className='referral-container'>
        <div className="referral-header">
          <h2>Update Profile</h2>
          <FaGift className="gift-icon" />
        </div>
        
        <div className="referral-body">
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="form-control custom-input"
                placeholder="Enter Name"
              />
            </div>

            <div className="col-12 col-lg-6">
              <label className="form-label">Mobile No</label>
              <input
                type="text"
                name="mobile"
                value={profileData.mobile}
                onChange={handleChange}
                className="form-control custom-input"
                placeholder="Enter Mobile No"
              />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <label className="form-label">Email Id</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="form-control custom-input"
                placeholder="Enter Email Id"
              />
            </div>

            <div className="col-12 col-lg-6">
              <label className="form-label">Select Payout Mode</label>
              <div className="payment-select-wrapper">
                <select
                  className="form-select custom-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="BANK">BANK</option>
                </select>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <label className="form-label">Upi Id</label>
              <input
                type="text"
                name="upiId"
                value={profileData.upiId}
                onChange={handleChange}
                className="form-control custom-input"
                placeholder="Enter UPI"
              />
            </div>

            <div className="col-12 col-lg-6">
              <label className="form-label">Upload UPI QR</label>
              <div className="upload-box">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="form-control custom-input"
                  accept="image/*"
                />
              </div>
            </div>

            {paymentMethod === 'BANK' && (
              <>
                <div className="col-12 col-lg-6">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    name="accountNo"
                    value={profileData.accountNo}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="Enter Account Number"
                  />
                </div>

                <div className="col-12 col-lg-6">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    name="ifsc"
                    value={profileData.ifsc}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="Enter IFSC Code"
                  />
                </div>

                <div className="col-12 col-lg-6">
                  <label className="form-label">Holder Name</label>
                  <input
                    type="text"
                    name="holderName"
                    value={profileData.holderName}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="Enter Holder Name"
                  />
                </div>

                <div className="col-12 col-lg-6">
                  <label className="form-label">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={profileData.branch}
                    onChange={handleChange}
                    className="form-control custom-input"
                    placeholder="Enter Branch"
                  />
                </div>
              </>
            )}
          </div>

          <div className="row mt-5">
            <div className="col-12 d-flex justify-content-center">
              <button
                className="update-profile-btn"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? 'PLEASE WAIT...' : 'UPDATE PROFILE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;