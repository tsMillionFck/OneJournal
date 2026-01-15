import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        // Ideally verify token with backend here, for now just load from local storage if needed
        // or assume valid session if token exists.
        // For improvements: Implement a 'GET /me' user route.
        const storedUser = localStorage.getItem("user-data");
        if (storedUser) setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("auth-token", token);
    localStorage.setItem("user-data", JSON.stringify(userData));
    setUser(userData);
  };

  const updateUserData = (updatedData) => {
    // Keep existing data but overwrite updated fields
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user-data", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUserData, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
