import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaCopy, FaCheck, FaUser, FaRupeeSign, FaWallet, 
  FaHistory, FaArrowRight, FaInfoCircle
} from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient";
import './AddFund.css';

const AddFunds = () => {
  const navigate = useNavigate();
  const { userData, refreshData } = useUser();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [userCheck, setUserCheck] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    amount: "",
    upiId: "",
    transactionId: "",
  });

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const checkUser = async () => {
    const loginId = formData.userId;
    if (!loginId) {
      setUserCheck(null);
      return;
    }
    
    setCheckingUser(true);
    try {
      const res = await apiClient.get(`/User/check-user?loginid=${loginId}`);
      
      if (res.data?.success && res.data.data) {
        const userName = res.data.data.Name || res.data.data.profilename;
        setUserCheck({ found: true, name: userName, data: res.data.data });
        setFormData(prev => ({ ...prev, userName: userName }));
      } else {
        setUserCheck({ found: false, name: "User Not Found" });
        setFormData(prev => ({ ...prev, userName: "" }));
      }
    } catch (err) {
      setUserCheck({ found: false, name: "Error checking user" });
      setFormData(prev => ({ ...prev, userName: "" }));
    } finally {
      setCheckingUser(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.userId && formData.userId.length >= 3) {
        checkUser();
      } else {
        setUserCheck(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    refreshData();
    setFormData({
      userId: "",
      userName: "",
      amount: "",
      upiId: "",
      transactionId: "",
    });
    setUserCheck(null);
    navigate("/dashboard");
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    
    if (!formData.userId) {
      toast.error("Please enter User ID!");
      return;
    }
    if (!userCheck?.found) {
      toast.error("Please enter a valid User ID!");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) < 100) {
      toast.error("Minimum add funds amount is ₹100!");
      return;
    }
    if (!formData.upiId) {
      toast.error("Please enter your UPI ID!");
      return;
    }
    if (!formData.transactionId) {
      toast.error("Please enter Transaction ID!");
      return;
    }
    
    setLoading(true);
    
    const payload = {
      userId: formData.userId,
      amount: parseFloat(formData.amount),
      upiId: formData.upiId,
      transactionId: formData.transactionId,
      status: "pending"
    };
    
    try {
      const response = await apiClient.post("/Transaction/add-funds", payload);
      
      if (response.data.success === true) {
        setTransactionData({
          amount: formData.amount,
          userId: formData.userId,
          userName: formData.userName,
          upiId: formData.upiId,
          transactionId: formData.transactionId,
          status: "Pending"
        });
        setShowSuccessModal(true);
        toast.success("Fund request submitted successfully!");
      } else {
        toast.error(response.data.message || "Failed to submit request");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Server Error";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="addfunds-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-12">
              
              <div className="funds-form-card">
                <div className="funds-header">
                  <h2>Add Funds to Wallet</h2>
                  <div className="balance-badge">
                    <FaWallet />
                    <span>₹{(userData?.currentamt || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <form onSubmit={handleAddFunds}>
                  {/* User ID Field */}
                  <div className="input-group-custom">
                    <label>
                      <FaUser className="input-icon" />
                      User ID / Login ID
                      <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="userId" 
                      placeholder="Enter your User ID" 
                      value={formData.userId} 
                      onChange={handleChange} 
                      className={userCheck?.found ? "valid" : userCheck === null ? "" : "invalid"}
                      required 
                    />
                    {checkingUser && <span className="input-hint checking">Verifying user...</span>}
                    {userCheck?.found && !checkingUser && (
                      <span className="input-hint success">✓ {userCheck.name}</span>
                    )}
                    {userCheck && !userCheck.found && !checkingUser && (
                      <span className="input-hint error">✗ User not found</span>
                    )}
                  </div>

                  {/* Amount Field */}
                  <div className="input-group-custom">
                    <label>
                      <FaRupeeSign className="input-icon" />
                      Amount
                      <span className="required">*</span>
                    </label>
                    <div className="amount-input">
                      <span className="currency">₹</span>
                      <input 
                        type="number" 
                        name="amount" 
                        placeholder="Enter Amount" 
                        value={formData.amount} 
                        onChange={handleChange} 
                        required 
                        min="100"
                        step="1"
                      />
                    </div>
                    <div className="quick-amounts">
                      {quickAmounts.map(amt => (
                        <button 
                          key={amt}
                          type="button"
                          className={`quick-amount ${formData.amount === amt.toString() ? 'active' : ''}`}
                          onClick={() => handleQuickAmount(amt)}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <small className="field-note">Minimum amount: ₹100</small>
                  </div>

                  {/* UPI ID Field */}
                  <div className="input-group-custom">
                    <label>
                      <FaWallet className="input-icon" />
                      Your UPI ID
                      <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="upiId" 
                      placeholder="e.g., username@okhdfcbank" 
                      value={formData.upiId} 
                      onChange={handleChange} 
                      required 
                    />
                    <small className="field-note">The UPI ID from which you made the payment</small>
                  </div>

                  {/* Transaction ID Field */}
                  <div className="input-group-custom">
                    <label>
                      <FaHistory className="input-icon" />
                      Transaction ID / Reference No
                      <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="transactionId" 
                      placeholder="Enter Transaction ID from your UPI app" 
                      value={formData.transactionId} 
                      onChange={handleChange} 
                      required 
                    />
                    <small className="field-note">Found in your UPI app payment history</small>
                  </div>
                  {/* Info Note */}
                  <div className="info-note-box">
                    <FaInfoCircle />
                    <div>
                      <strong>Important Notes:</strong>
                      <p>✓ Send exact amount from your registered UPI ID</p>
                      <p>✓ Amount will be credited within 5-10 minutes after verification</p>
                      <p>✓ Keep Transaction ID for future reference</p>
                      <p>✓ Contact support for any payment issues</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="submit-funds-btn" 
                    disabled={loading || !userCheck?.found}
                  >
                    {loading ? (
                      <>Processing Request <div className="btn-spinner"></div></>
                    ) : (
                      <>Add Funds <FaArrowRight /></>
                    )}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && transactionData && (
        <div className="custom-modal-overlay" onClick={handleModalClose}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-success-icon">✓</div>
              <h3>Request Submitted!</h3>
              <button className="modal-close-custom" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-body-custom">
              <div className="modal-details">
                <div className="modal-detail-row">
                  <span>User ID:</span>
                  <strong>{transactionData.userId}</strong>
                  <button className="modal-copy" onClick={() => handleCopy(transactionData.userId, "User ID")}>
                    {copiedField === "User ID" ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <div className="modal-detail-row">
                  <span>Amount:</span>
                  <strong className="amount-highlight">₹{parseFloat(transactionData.amount).toLocaleString('en-IN')}</strong>
                  <button className="modal-copy" onClick={() => handleCopy(transactionData.amount, "Amount")}>
                    {copiedField === "Amount" ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <div className="modal-detail-row">
                  <span>UPI ID:</span>
                  <strong>{transactionData.upiId}</strong>
                </div>
                <div className="modal-detail-row">
                  <span>Transaction ID:</span>
                  <strong>{transactionData.transactionId}</strong>
                  <button className="modal-copy" onClick={() => handleCopy(transactionData.transactionId, "Transaction ID")}>
                    {copiedField === "Transaction ID" ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <div className="modal-detail-row">
                  <span>Status:</span>
                  <span className="status-badge">Pending</span>
                </div>
              </div>
              
              <div className="modal-footer-custom">
                <button className="modal-btn-primary" onClick={handleModalClose}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFunds;