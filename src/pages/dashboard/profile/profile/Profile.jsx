import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import './Profile.css'

const Profile = () => {

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
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
  })

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        'https://badshahapi-1-k90n.onrender.com/api/Authentication/login',
        {
          loginId: 'BETID',
          password: 'pqr0990',
          deviceId: 'string'
        }
      )

      if (response.data.success) {
        const user = response.data.data
        setProfileData({
          name: user?.profilename || '',
          mobile: user?.mobile || '',
          email: user?.email || '',
          upiId: user?.upiId || '',
          accountNo: user?.Accountno || '',
          ifsc: user?.Ifsccode || '',
          holderName: user?.holdername || '',
          branch: user?.branch || '',
          qrImage: null
        })
        localStorage.setItem('token', response.data.token)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      qrImage: e.target.files[0]
    }))
  }

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      console.log('UPDATED DATA =>', profileData)
      toast.success('Profile Updated Successfully')
    } catch (error) {
      console.log(error)
      toast.error('Update Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      {/* ✅ Fixed Toaster with high z-index */}
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
          success: {
            style: {
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #dc3545, #c82333)',
              color: '#fff',
            },
          },
        }}
        containerStyle={{
          zIndex: 999999,
        }}
      />

      <div className="withdraw-card">
        {/* HEADER */}
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center mb-4">
            <div className="withdraw-header">
              <h3 className="mb-0">Profile</h3>
            </div>
            <button className="payout-history-btn">🎁</button>
          </div>
        </div>

        {/* TOP SECTION */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <label className="form-label">Name</label>
            <div className="balance-card">
              <h2 className="payoutable-amount">{profileData.name || '---'}</h2>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <label className="form-label">Mobile No</label>
            <div className="balance-card">
              <h2 className="payoutable-amount">{profileData.mobile || '---'}</h2>
            </div>
          </div>
        </div>

        {/* INPUT SECTION */}
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
                className="form-control upload-input"
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

        {/* BUTTON */}
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
  )
}

export default Profile