import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      let storedUser = localStorage.getItem("user-data");
      if (!storedUser) {
        const defaultUser = { username: "Journaler", email: "local@onejournal" };
        localStorage.setItem("user-data", JSON.stringify(defaultUser));
        storedUser = JSON.stringify(defaultUser);
      }
      setUser(JSON.parse(storedUser));
      setLoading(false);
    };
    initializeUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("user-data", JSON.stringify(userData));
    setUser(userData);
  };

  const updateUserData = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user-data", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("user-data");
    // Re-initialize with default guest user
    const defaultUser = { username: "Journaler", email: "local@onejournal" };
    localStorage.setItem("user-data", JSON.stringify(defaultUser));
    setUser(defaultUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUserData, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
