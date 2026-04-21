export const validateDisplayName = (name) => {
  if (!name || !name.trim()) {
    return "Display name is required";
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    return "Email is required";
  }
  if (!emailRegex.test(email)) {
    return "Invalid email address";
  }
  return null;
};

export const validatePasswords = (currentPassword, newPassword, confirmPassword) => {
  const errors = {};
  
  // Only validate if any password field is filled
  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword) {
      errors.currentPassword = "Current password is required to change password";
    }
    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  }
  
  return errors;
};

export const validateSettings = (formData) => {
  const errors = {};
  
  const displayNameError = validateDisplayName(formData.displayName);
  if (displayNameError) {
    errors.displayName = displayNameError;
  }
  
  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  const passwordErrors = validatePasswords(
    formData.currentPassword,
    formData.newPassword,
    formData.confirmPassword
  );
  
  return { ...errors, ...passwordErrors };
};