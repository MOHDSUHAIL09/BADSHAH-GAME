import { createContext, useState, useEffect, useContext, useRef } from "react";
import apiClient from "../api/apiClient";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchIntervalRef = useRef(null);

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
      console.log("Dashboard-Api Response:", res.data);

      if (res.data.success) {
        const apiData = res.data.data;
        const newUserData = {
          pid: apiData.pid || user?.pid,
          currentamt: apiData.currentamt || 0,
          currentAmount: apiData.currentAmount,
          gameid: apiData.gameid,
          seconds: apiData.seconds,
          totbettingamt: apiData.totbettingamt || 0,
          debit: apiData.debit,
          WinnerNumber: apiData.WinnerNumber,
        };

        setUserData(newUserData);
        localStorage.setItem("userData", JSON.stringify(newUserData));

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: newUserData }));
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FORCE REFRESH (Called at last 10 seconds) =================
  const forceRefresh = async () => {
    await fetchData();
  };

  // ================= LOGIN =================
  const loginUser = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    localStorage.setItem("regno", userData.regno || userData.RegNo || userData.randomid);
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
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      // Auto refresh every 30 seconds
      fetchIntervalRef.current = setInterval(() => {
        fetchData();
      }, 30000);
    }

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        loading,
        refreshData: fetchData,
        forceRefresh,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);