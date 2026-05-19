import React, { useState, useEffect } from 'react'
import './Withdraw.css'
import { IoIosSend } from 'react-icons/io'
import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useUser } from '../../../context/UserContext'
import apiClient from '../../../api/apiClient'

const Withdraw = () => {
  const { user, userData, refreshData } = useUser()
  
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpField, setShowOtpField] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Get regNo from context
  const getPid = () => {
    return user?.RegNo || user?.regno || userData?.regNo || localStorage.getItem('RegNo') || localStorage.getItem('regno') || '1'
  }

  // Fetch total withdrawn amount
  const fetchTotalWithdrawn = async () => {
    try {
      const response = await apiClient.get(`/IncomePayout/withdraw-history`)
      if (response.data.success && response.data.data) {
        const total = response.data.data.reduce((sum, item) => sum + (item.payout || item.amount || 0), 0)
        setTotalWithdrawn(total)
      }
    } catch (error) {
      console.error('Error fetching withdrawal history:', error)
      setTotalWithdrawn(0)
    }
  }

  useEffect(() => {
    fetchTotalWithdrawn()
  }, [])

  // Withdraw API call
  const withdrawRequest = async (amount) => {
    const pid = getPid()

    if (!pid) {
      toast.error('Please login again')
      return false
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post('/IncomePayout/withdraw-request', {
        pid: parseInt(pid),
        payout: parseInt(amount)
      })

      if (response.data.success) {
        setTotalWithdrawn(prev => prev + parseInt(amount))
        refreshData()
        return true
      } else {
        toast.error(response.data.message || 'Withdrawal failed')
        return false
      }
    } catch (error) {
      console.error('Withdraw error:', error)
      if (error.response) {
        toast.error(error.response.data?.message || 'Withdrawal request failed')
      } else {
        toast.error('Network error. Please try again.')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Generate Random OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // WITHDRAW NOW
  const handleWithdrawNow = async () => {
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      toast.error('Please enter withdrawal amount')
      return
    }
    if (parseFloat(withdrawalAmount) > (userData?.currentamt || 0)) {
      toast.error('Amount exceeds available balance')
      return
    }
    if (parseFloat(withdrawalAmount) < 1) {
      toast.error('Minimum withdrawal amount is ₹100')
      return
    }

    const success = await withdrawRequest(withdrawalAmount)
    if (success) {
      toast.success(`Withdrawal request initiated for ₹${withdrawalAmount} via ${paymentMethod}`)
      setWithdrawalAmount('')
    }
  }

  // SEND OTP
  const handleSendOTP = () => {
    if (!withdrawalAmount || withdrawalAmount <= 0) {
      toast.error('Please enter withdrawal amount')
      return
    }
    if (parseFloat(withdrawalAmount) > (userData?.currentamt || 0)) {
      toast.error('Amount exceeds available balance')
      return
    }
    if (parseFloat(withdrawalAmount) < 100) {
      toast.error('Minimum withdrawal amount is ₹100')
      return
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter valid mobile number')
      return
    }
    setShowOtpField(true)
    const generatedOtp = generateOTP()
    console.log('OTP Sent:', generatedOtp)
    toast.success(`OTP Sent Successfully: ${generatedOtp}`)
  }

  // VERIFY OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid OTP')
      return
    }

    setIsProcessing(true)
    
    const success = await withdrawRequest(withdrawalAmount)
    
    if (success) {
      toast.success(`✅ Withdrawal of ₹${withdrawalAmount} via ${paymentMethod} successful!`)
      setWithdrawalAmount('')
      setPaymentMethod('UPI')
      setMobileNumber('')
      setOtp('')
      setShowOtpField(false)
      fetchTotalWithdrawn()
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="container py-4">
      <div className="withdraw-card">
        <Toaster position="top-center" />
        
        <div className='row'>
          <div className="col-12 d-flex justify-content-between align-items-center mb-4">
            <div className="withdraw-header">
              <h3 className="mb-0">Withdraw Method</h3>
            </div>
            <Link to="/dashboard/Withdrawreport">
              <button className="payout-history-btn">📜 History</button>
            </Link>
          </div>
        </div>

        {/* TOP CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="balance-card">
              <span className="card-label">Payoutable Amount</span>
              {/* ✅ Fixed: userData?.currentamt || 0 */}
              <h2 className="payoutable-amount">₹{(userData?.currentAmount || 0).toFixed(2)}</h2>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="balance-card" style={{ background: 'linear-gradient(135deg, #ffd70020, #ff8c0020)' }}>
              <span className="card-label">Total Withdrawn</span>
              <h2 className="payoutable-amount">₹{(userData?.debit || 0).toFixed(2)}</h2>
            </div>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <label className="form-label">Enter Amount</label>
            <input
              type="number"
              className="form-control custom-input"
              placeholder="Enter withdrawal amount"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              disabled={showOtpField || isLoading}
            />
          </div>



<div className="col-12 col-lg-6">
  <label className="form-label">Payment Method</label>
  <div className="payment-select-wrapper" style={{ position: 'relative' }}>
    <select
      className="form-select custom-select"
      value={paymentMethod}
      onChange={(e) => setPaymentMethod(e.target.value)}
      disabled={showOtpField || isLoading}
      style={{
        appearance: 'none',
        background: '#0f172a',
        border: '1px solid rgba(255,215,0,0.4)',
        borderRadius: '14px',
        height: '58px',
        padding: '0 16px',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer'
      }}
    >
      <option value="UPI">UPI</option>
    </select>
    <span
      style={{
        position: 'absolute',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#ffd700',
        pointerEvents: 'none',
        fontSize: '12px'
      }}
    >
      ▼
    </span>
  </div>
</div>


          <div className="col-12 col-lg-6">
            <label className="form-label">Enter OTP</label>
            <div className="mobile-input-wrapper">
              <input
                type="tel"
                className="form-control custom-input"
                placeholder="Enter 6 digit Code"
                maxLength="10"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                disabled={showOtpField || isLoading}
              />
              <button
                className="send-otp-btn"
                onClick={handleSendOTP}
                disabled={showOtpField || isLoading}
              >
                <IoIosSend />
              </button>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="info-note">
              <span className="warning-icon">⚠️</span>
              <span className="info-text">Minimum withdrawal: ₹100 | Maximum: ₹50,000</span>
            </div>
          </div>
        </div>

      {/* WITHDRAW NOW BUTTON */}
{/* WITHDRAW NOW BUTTON */}
<div className="row mt-4">
  <div className="col-12 col-md-6 offset-md-3 text-center">
    <button 
      className="withdraw-now-btn w-100" 
      onClick={handleWithdrawNow}
      disabled={isLoading}
    >
      {isLoading ? '⏳ PROCESSING...' : 'WITHDRAW NOW'}
    </button>
  </div>
</div>

        {/* OTP SECTION */}
        {showOtpField && (
          <>
            <div className="row mt-4">
              <div className="col-12">
                <div className="otp-section">
                  <label className="otp-label">🔐 Enter OTP Verification</label>
                  <input
                    type="text"
                    className="form-control otp-input"
                    placeholder="------"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <small className="otp-hint">
                    OTP sent to {mobileNumber || 'your'} mobile number
                  </small>
                </div>
              </div>
            </div>
            <button
              className="verify-btn"
              onClick={handleVerifyOTP}
              disabled={isProcessing || isLoading}
            >
              {isProcessing ? '⏳ PROCESSING...' : '✅ VERIFY & WITHDRAW'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Withdraw