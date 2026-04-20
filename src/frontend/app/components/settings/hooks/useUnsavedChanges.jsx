import { useState, useEffect } from "react";
import { defaultFormData } from "../utils/constants";

export const useUnsavedChanges = (formData) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("userSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const { avatar: savedAvatar, ...savedRest } = parsed;
        const { avatar: currentAvatar, ...currentRest } = formData;
        const isDifferent = JSON.stringify(savedRest) !== JSON.stringify(currentRest);
        setHasUnsavedChanges(isDifferent);
      } catch (e) {
        setHasUnsavedChanges(true);
      }
    } else {
      const { avatar, ...currentRest } = formData;
      const { avatar: defaultAvatar, ...defaultRest } = defaultFormData;
      const isDifferent = JSON.stringify(currentRest) !== JSON.stringify(defaultRest);
      setHasUnsavedChanges(isDifferent);
    }
  }, [formData]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return hasUnsavedChanges;
};