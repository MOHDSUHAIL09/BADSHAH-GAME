import React from 'react'
import { FaGift, FaCopy } from 'react-icons/fa'
import './Referral.css'

const Referral = () => {
  return (
    <div className='container'>
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

              <p className="referral-link">
                www.winbit.live/Signup.aspx?ref=BETID
              </p>

              <button className="copy-btn">
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

                <span>10</span>
              </div>
            </div>

            {/* Total Bonus */}
            <div className="referral-card">
              <h3>Total Referral Bonus</h3>

              <div className="card-value">
                <FaGift className="card-icon" />

                <span>0.00</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Referral