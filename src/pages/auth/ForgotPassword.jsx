import  { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../api/apiClient";
// import signupImage from "../../assets/Images/login-img.png";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedId = loginId.trim();
    if (!trimmedId) {
      toast.error("Please enter your Login ID / Email");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/Authentication/forget-password", trimmedId, {});
      const responseData = response.data || response;
      if (responseData.result === "true" || responseData.success === true) {
        toast.success(responseData.message || "Password recovery instructions sent");
        navigate("/login");
      } else {
        const errorMsg = Array.isArray(responseData.message)
          ? responseData.message[0]
          : responseData.message || "Request failed";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      if (error.response?.data?.message) {
        const msg = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;
        toast.error(msg);
      } else {
        toast.error("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('loaded');
    return () => document.body.classList.remove('loaded');
  }, []);


  return (
    <>
      <div className="bd-bg">
        {/* Forgot Password Form Section (same layout as Signup/Login) */}
        <div className="mediic-appoinment">
          <div className="container">
            <div className="row g-4">
                   <div class="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
           <div className="d-flex justify-content-center align-items-center">
             <div className="text-center m-auto">
              <h1 className="text-white mb-0">⚡ BADSHAH  &nbsp; GAME ⚡&nbsp; </h1>
             </div>
           </div>
            </div> 

              <div className="col-lg-6">
                <div className="auth-form">
                <div className="mediic-section-title2">
                  <h4>FORGOT PASSWORD</h4>
                  <h3 className="Sign-text">Recover your account</h3>
                </div>
                <div className="contact-form-box">
                  <form onSubmit={handleSubmit} id="forgot-form">
                    <div className="row">
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="text"
                            placeholder="Enter Login ID / Email"
                            className="fp-input"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <p className="signup-footer-text">
                          Remember password?{" "}
                          <a href="/login" className="colorr" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                            Back to Login
                          </a>
                        </p>
                      </div>
                      <div className="col-lg-12 col-md-6">
                        <div className="submit-button">
                          <button type="submit" className="laboix-btn" disabled={loading}>
                            {loading ? "Sending..." : "Recover Password"} <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" fill="currentColor" class="bi bi-arrow-return-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;