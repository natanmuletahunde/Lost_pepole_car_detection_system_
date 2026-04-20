import { useState, useEffect } from "react";

export const usePasswordStrength = (password) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) {
      score = score + 25;
    } else if (password.length >= 6) {
      score = score + 15;
    }

    // Contains number
    if (/\d/.test(password)) {
      score = score + 25;
    }

    // Contains lowercase
    if (/[a-z]/.test(password)) {
      score = score + 25;
    }

    // Contains uppercase
    if (/[A-Z]/.test(password)) {
      score = score + 25;
    }

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) {
      score = score + 25;
    }

    if (score > 100) {
      setStrength(100);
    } else {
      setStrength(score);
    }
  }, [password]);

  const getColor = () => {
    if (strength < 30) {
      return "red";
    }
    if (strength < 60) {
      return "orange";
    }
    if (strength < 80) {
      return "yellow";
    }
    return "green";
  };

  const getLabel = () => {
    if (strength < 30) {
      return "Weak";
    }
    if (strength < 60) {
      return "Fair";
    }
    if (strength < 80) {
      return "Good";
    }
    return "Strong";
  };

  return { 
    strength: strength, 
    getColor: getColor, 
    getLabel: getLabel 
  };
};