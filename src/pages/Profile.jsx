import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, X, LogOut, Edit2, Save } from "lucide-react";

const Profile = () => {
  const { user, logout, updateUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = async () => {
    setMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, username }),
      });

      const data = await res.json();
      if (res.ok) {
        updateUserData({ username: data.username });
        setIsEditing(false);
        setMsg("Profile updated!");
      } else {
        setMsg("Update failed");
      }
    } catch (err) {
      console.error(err);
      setMsg("Server error");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-200">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black font-['Playfair_Display'] capitalize">
            {username}
          </h2>
          <p className="text-gray-400 text-sm tracking-wide">{user.email}</p>
        </div>

        {msg && (
          <div className="bg-blue-50 text-blue-800 text-center py-2 rounded-lg mb-4 text-xs font-bold tracking-wide">
            {msg}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider">
              Username
            </label>
            <div className="flex gap-2">
              <input
                className={`flex-1 bg-gray-50 border-2 rounded-xl py-3 px-4 text-gray-700 leading-tight focus:outline-none transition-colors ${
                  isEditing
                    ? "border-black bg-white"
                    : "border-gray-200 cursor-not-allowed"
                }`}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
              />
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-8 rounded-xl transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
