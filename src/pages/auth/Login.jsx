import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../api/apiClient";
import { useUser } from "../../context/UserContext";
import './auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    deviceId: "web-browser"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (cooldown) {
      toast.error("Please wait 30 seconds before trying again!");
      return;
    }
    
    setLoading(true);
    
    const payload = {
      loginId: formData.loginId,
      password: formData.password,
      deviceId: formData.deviceId
    };
    
    try {
      const response = await apiClient.post("/Authentication/login", payload);
      console.log("loginapi", response);
      
      if (response.data.success === true || response.data.statusCode === 200) {
        const userData = response.data.data;
        const token = response.data.token;
        
        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("regno", userData.Regno || userData.regno);
        localStorage.setItem("isLoggedIn", "true");
        
        // Update context
        loginUser(userData, token);
        
        toast.success("Login Successful!");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        toast.error(response.data.message || "Invalid Login Details");
      }
    } catch (error) {
      console.error("Login Error:", error.response);
      
      if (error.response?.status === 429) {
        toast.error("Too many attempts! Please wait 30 seconds.");
        setCooldown(true);
        setTimeout(() => setCooldown(false), 30000);
      } else if (error.response?.status === 401) {
        toast.error("Invalid credentials! Please check your login ID and password.");
      } else if (error.response?.status === 404) {
        toast.error("User not found! Please sign up first.");
      } else {
        const errorMsg = error.response?.data?.message || "Login Failed: Server Error";
        toast.error(errorMsg);
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
      <div className="mediic-appoinment">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
              <div className="d-flex justify-content-center align-items-center">
                <div className="text-center m-auto">
                  <h1 className="text-white mb-0">⚡ BADSHAH &nbsp; GAME ⚡&nbsp;</h1>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="auth-form">
                <div className="mediic-section-title2">
                  <h4>LOGIN ACCOUNT</h4>
                  <h3 className="Sign-text">Login to your account</h3>
                </div>
                <div className="contact-form-box">
                  <form className="auth-form01" onSubmit={handleLogin} id="login-form">
                    <div className="row">
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="text"
                            name="loginId"
                            placeholder="Login ID*"
                            value={formData.loginId}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="password"
                            name="password"
                            placeholder="Password*"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <p className="signup-footer-text">
                          Forgot password?{" "}
                          <Link to="/forgotpassword">
                            Reset Here
                          </Link>
                        </p>
                      </div>
                      <div className="col-lg-12">
                        <p className="signup-footer-text">
                          Don't have an account?{" "}
                          <Link to="/signup" className="colorr">
                            Create Account
                          </Link>
                        </p>
                      </div>
                      <div className="col-lg-12 col-md-6">
                        <div className="submit-button">
                          <button type="submit" className="laboix-btn" disabled={loading || cooldown}>
                            {loading ? "Logging in..." : cooldown ? "Please wait..." : "Login Now"} 
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" fill="currentColor" className="bi bi-arrow-return-right" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5" />
                            </svg>
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
    </>
  );
};

export default Login;