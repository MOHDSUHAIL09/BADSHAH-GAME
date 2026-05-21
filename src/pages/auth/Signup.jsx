import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCopy, FaCheck, FaUser, FaEnvelope, FaIdCard } from "react-icons/fa";
import apiClient from "../../api/apiClient";
import './auth.css'

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const [formData, setFormData] = useState({
    introRegNo: "",
    referrer_Id: "",
    sponsorName: "",
    fName: "",
    mobile: "",
    email: "",
    password: "",
  });

  // URL se ref param read karo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    console.log("🔍 URL params:", window.location.search);
    console.log("🔍 refCode from URL:", refCode);

    if (refCode && !formData.referrer_Id) {
      console.log("✅ Auto-filling sponsor ID with:", refCode);
      setFormData(prev => ({
        ...prev,
        referrer_Id: refCode,
        introRegNo: refCode,
      }));
    }
  }, []);

  // Sponsor name fetch karo
  useEffect(() => {
    const fetchSponsor = async () => {
      const loginId = formData.referrer_Id;
      console.log("🔍 Fetching sponsor for loginId:", loginId);
      
      if (loginId) {
        try {
          const res = await apiClient.get(`/User/check-user?loginid=${loginId}`);
          console.log("📡 Sponsor API Response:", res.data);
          
          if (res.data?.success && res.data.data) {
            const sponsorName = res.data.data.Name || res.data.data.profilename;
            const regno = res.data.data.regno || res.data.data.randomid;
            console.log("✅ Sponsor found:", sponsorName, "RegNo:", regno);
            
            setFormData(prev => ({
              ...prev,
              sponsorName: sponsorName,
              introRegNo: regno,
            }));
          } else {
            console.log("❌ Sponsor not found");
            setFormData(prev => ({ ...prev, sponsorName: "Invalid Sponsor" }));
          }
        } catch (err) {
          console.error("❌ Sponsor fetch error:", err);
          setFormData(prev => ({ ...prev, sponsorName: "Not Found" }));
        }
      } else {
        setFormData(prev => ({ ...prev, sponsorName: "" }));
      }
    };
    
    const timer = setTimeout(fetchSponsor, 500);
    return () => clearTimeout(timer);
  }, [formData.referrer_Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("📝 Input changed:", name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("🔴 1. FUNCTION STARTED");
    console.log("🔴 2. Form Data:", formData);
    
    // ✅ VALIDATIONS
    if (!formData.referrer_Id) {
      console.log("🔴 3. Sponsor ID missing");
      toast.error("Please enter Sponsor ID!");
      return;
    }
    
    if (!formData.sponsorName || formData.sponsorName === "Invalid Sponsor") {
      console.log("🔴 4. Invalid Sponsor");
      toast.error("Please enter a valid Sponsor ID!");
      return;
    }
    
    if (!formData.fName) {
      console.log("🔴 5. Name missing");
      toast.error("Please enter your name!");
      return;
    }
    
    if (!formData.email) {
      console.log("🔴 6. Email missing");
      toast.error("Please enter your email!");
      return;
    }
    
    if (!formData.mobile || formData.mobile.length !== 10) {
      console.log("🔴 7. Invalid Mobile:", formData.mobile);
      toast.error("Please enter a valid 10-digit mobile number!");
      return;
    }
    
    if (!formData.password || formData.password.length < 4) {
      console.log("🔴 8. Invalid Password");
      toast.error("Password must be at least 4 characters!");
      return;
    }
    
    console.log("🔴 9. All validations passed!");
    setLoading(true);
    
    const payload = {
      name: formData.fName,
      phone: formData.mobile,
      email: formData.email,
      loginId: formData.mobile,
      pass: formData.password,
      sName: formData.sponsorName || "Game",
      sLoginId: formData.referrer_Id
    };
    
    console.log("📤 10. Sending payload:", payload);
    
    try {
      console.log("📡 11. Calling API...");
      const response = await apiClient.post("/Authentication/register", payload);
      console.log("📥 12. Response Status:", response.status);
      console.log("📥 13. Response Data:", response.data);
      
      if (response.data.success === true) {
        console.log("✅ 14. Registration Success!");
        setRegisteredUser({
          regno: response.data.data?.randomid,
          loginId: response.data.data?.loginid || formData.mobile,
          name: response.data.data?.profilename || formData.fName,
          email: response.data.data?.email || formData.email,
          mobile: response.data.data?.mobile || formData.mobile,
          sponsorId: formData.referrer_Id,
          sponsorName: formData.sponsorName,
          password: formData.password,
        });
        setShowSuccessModal(true);
        toast.success("Registration Successful!");
        
        // Reset form
        setFormData({
          introRegNo: "",
          referrer_Id: "",
          sponsorName: "",
          fName: "",
          mobile: "",
          email: "",
          password: "",
        });
      } else {
        console.log("❌ 15. Registration Failed:", response.data.message);
        toast.error(response.data.message || "Registration Failed");
      }
    } catch (error) {
      console.error("❌ 16. Signup Error:", error);
      console.error("❌ 17. Error Response:", error.response);
      console.error("❌ 18. Error Status:", error.response?.status);
      console.error("❌ 19. Error Data:", error.response?.data);
      
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.title || 
                       error.message || 
                       "Server Error";
      toast.error(errorMsg);
    } finally {
      console.log("🔴 20. Finally block - loading false");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mediic-appoinment">    
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
              <div className="d-flex justify-content-center align-items-center">
                <div className="text-center m-auto">
                  <h1 className="text-white mb-0">⚡ BADSHAH GAME ⚡</h1>
                </div>
              </div>
            </div> 
          
            <div className="col-lg-6">
              <div className="auth-form">
                <div className="mediic-section-title22">
                  <h4>SIGNUP ACCOUNT</h4>
                  <h3 className="Sign-text">Sign up to your account</h3>
                </div>
                <div className="contact-form-box">
                  <form onSubmit={handleSignup}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="text" 
                            name="referrer_Id" 
                            placeholder="Sponsor ID*" 
                            value={formData.referrer_Id} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="text" 
                            value={formData.sponsorName} 
                            readOnly 
                            placeholder="Sponsor Name" 
                            className="readonly-input" 
                            style={{ color: "#008202", fontWeight: "600" }} 
                          />
                        </div>
                      </div>
                      
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="text" 
                            name="fName" 
                            placeholder="Full Name*" 
                            value={formData.fName} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address*" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="col-lg-12">
                        <div className="form-box d-flex" style={{ gap: "10px" }}>
                          <div className="mt-3">
                            <span style={{ padding: "20px 20px", background: "#f0f0f0", borderRadius: "15px" }}>+91</span>
                          </div>
                          <input 
                            type="text" 
                            name="mobile" 
                            placeholder="Mobile Number*" 
                            maxLength="10" 
                            value={formData.mobile} 
                            onChange={handleChange} 
                            required 
                            style={{ flex: 1 }} 
                          />
                        </div>
                      </div>
                      
                      <div className="col-lg-12">
                        <div className="form-box">
                          <input 
                            type="password" 
                            name="password" 
                            placeholder="Create Password*" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="col-lg-12">
                        <p className="signup-footer-text">
                          Already have an account? 
                          <Link to="/login" className="colorr">Login Here</Link>
                        </p>
                      </div>
                      
                      <div className="col-lg-12">
                        <button type="submit" className="laboix-btn" disabled={loading}>
                          {loading ? "Creating Account..." : "Signup Now"} 
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" fill="currentColor" className="bi bi-arrow-return-right" viewBox="0 0 16 16"> 
                            <path fillRule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && registeredUser && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="success-modal02" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header02">
              <div className="success-icon02">✓</div>
              <div className="Registration-text">Registration Successful</div>
              <button className="modal-close02" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="modal-body02">
              <div className="user-details-card02">
                <div className="Account-text"><FaIdCard /> Your Account Details</div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Registration No:</div>
                  <div className="detail-value02">
                    {registeredUser.regno}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.regno, "Registration No")}>
                      {copiedField === "Registration No" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Login ID:</div>
                  <div className="detail-value02">
                    {registeredUser.loginId}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.loginId, "Login ID")}>
                      {copiedField === "Login ID" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Password:</div>
                  <div className="detail-value02">
                    {registeredUser.password}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.password, "Password")}>
                      {copiedField === "Password" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Name:</div>
                  <div className="detail-value02">{registeredUser.name}</div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaEnvelope /> Email:</div>
                  <div className="detail-value02">
                    {registeredUser.email}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.email, "Email")}>
                      {copiedField === "Email" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Mobile:</div>
                  <div className="detail-value02">
                    {registeredUser.mobile}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.mobile, "Mobile")}>
                      {copiedField === "Mobile" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02"><FaUser /> Sponsor ID:</div>
                  <div className="detail-value02">
                    {registeredUser.sponsorId}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.sponsorId, "Sponsor ID")}>
                      {copiedField === "Sponsor ID" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions02">
                <Link to="/login">
                  <button className="btn-dashboard02" onClick={handleModalClose}>
                    GO TO LOGIN
                  </button>  
                </Link>          
              </div>  
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;