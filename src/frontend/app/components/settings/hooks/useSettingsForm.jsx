// components/settings/hooks/useSettingsForm.jsx
import { useState, useEffect } from "react";
import { defaultFormData } from "../utils/constants";

export const useSettingsForm = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  // LOAD: Get settings from db.json AND load avatar from localStorage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Load user data from db.json
        const response = await fetch("http://localhost:3001/users/1");
        if (response.ok) {
          const userData = await response.json();
          
          // Load avatar from localStorage
          const savedAvatar = localStorage.getItem("userAvatar");
          
          setFormData((prev) => ({
            ...prev,
            displayName: userData.displayName || "",
            email: userData.email || "",
            language: userData.language || "en",
            theme: userData.theme || "system",
            timezone: userData.timezone || "UTC",
            emailNotifications: userData.emailNotifications ?? true,
            pushNotifications: userData.pushNotifications ?? false,
            marketingEmails: userData.marketingEmails ?? false,
            profileVisibility: userData.profileVisibility || "public",
            showEmail: userData.showEmail ?? false,
            allowDataCollection: userData.allowDataCollection ?? true,
            avatar: savedAvatar || null, // Load avatar from localStorage
          }));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // SAVE: Save to db.json (without avatar) and save avatar to localStorage
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { avatar, currentPassword, newPassword, confirmPassword, ...dataToSave } = formData;
      
      // Save avatar to localStorage if it's a new file
      if (avatar && avatar instanceof File) {
        const reader = new FileReader();
        const avatarPromise = new Promise((resolve) => {
          reader.onloadend = () => {
            localStorage.setItem("userAvatar", reader.result);
            resolve();
          };
          reader.readAsDataURL(avatar);
        });
        await avatarPromise;
      }
      
      // Save other settings to db.json
      const response = await fetch("http://localhost:3001/users/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Settings saved successfully!",
        });
        
        // Update formData to remove the File object and use the stored string
        if (avatar && avatar instanceof File) {
          const storedAvatar = localStorage.getItem("userAvatar");
          setFormData((prev) => ({ ...prev, avatar: storedAvatar }));
        }
        
        return true;
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      setNotification({ 
        type: "error", 
        message: "Failed to save settings. Please try again." 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    notification,
    setNotification,
    errors,
    setErrors,
    handleChange,
    saveSettings,
  };
};