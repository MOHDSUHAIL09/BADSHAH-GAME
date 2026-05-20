import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import './Profile.css'
import { FaGift } from 'react-icons/fa'

const Profile = () => {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    mobile: '9876543210',
    email: 'john@example.com',
    upiId: 'john@okhdfcbank',
    accountNo: '123456789012',
    ifsc: 'HDFC0001234',
    holderName: 'John Doe',
    branch: 'Mumbai Main',
    qrImage: null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      setProfileData(prev => ({
        ...prev,
        qrImage: file
      }))
      toast.success('QR code uploaded successfully')
    }
  }

  const handleUpdateProfile = () => {
    setLoading(true)
    
    // Simulate update delay
    setTimeout(() => {
      toast.success('Profile updated successfully!')
      setLoading(false)
    }, 1000)
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
                readOnly
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
  )
}

export default Profile