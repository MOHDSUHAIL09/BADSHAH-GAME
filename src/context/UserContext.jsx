import { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../api/apiClient";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD FROM LOCALSTORAGE =================
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData);
        setUserData(parsed);
      } catch (e) {
        console.error("Error loading:", e);
      }
    }
  }, []);

  // ================= Dashboard Fetch =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!user || !token) {
        setLoading(false);
        return;
      }
      
      const regno = user?.RegNo || user?.regno || user?.id || localStorage.getItem("regno");
      if (!regno) {
        setLoading(false);
        return;
      }

      const res = await apiClient.get(`/Dashboard/dashboard/${regno}`);
      console.log("Dashboard-Api", res);
      
      if (res.data.success) {
        const apiData = res.data.data;
        const newUserData = {
          currentamt: apiData.currentamt || 0,
          currentAmount: apiData.currentAmount,
          gameid: apiData.gameid,
          seconds: apiData.seconds,
          totbettingamt: apiData.totbettingamt || 0,
          debit: apiData.debit,
          regNo: regno,
        };
         
        setUserData(newUserData);
        localStorage.setItem("userData", JSON.stringify(newUserData));
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= REFRESH USER DATA =================
  const refreshUserData = () => {
    const savedData = localStorage.getItem("userData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUserData(parsed);
      return parsed;
    }
    return userData;
  };

  // ================= LOGIN =================
  const loginUser = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    localStorage.setItem("regno", userData.regno || userData.RegNo);
    setUser(userData);
    setTimeout(() => fetchData(), 100);
  };

  // ================= LOGOUT =================
  const logoutUser = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("regno");
    localStorage.removeItem("userData");
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        loading,
        refreshData: fetchData,
        refreshUserData,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 