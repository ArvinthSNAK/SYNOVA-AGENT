/**
 * Unified Input Validation Utilities for SYNOVA Platform
 */

export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      errors: ['Password is required'],
      requirements: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
      },
    };
  }

  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const passedCount = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  const errors = [];
  if (!minLength) errors.push('At least 8 characters');
  if (!hasUpper) errors.push('At least one uppercase letter (A-Z)');
  if (!hasLower) errors.push('At least one lowercase letter (a-z)');
  if (!hasNumber) errors.push('At least one number (0-9)');
  if (!hasSpecial) errors.push('At least one special character (!@#$%^&*)');

  return {
    isValid: passedCount === 5,
    score: passedCount, // 0 to 5
    strength: passedCount <= 2 ? 'Weak' : passedCount <= 4 ? 'Medium' : 'Strong',
    strengthColor: passedCount <= 2 ? '#E11D48' : passedCount <= 4 ? '#F59E0B' : '#10B981',
    errors,
    requirements: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    },
  };
};

export const formatVehicleRegistration = (val) => {
  if (!val) return '';
  const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length <= 2) return clean;
  if (clean.length <= 4) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  if (clean.length <= 6) return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 6)}-${clean.slice(6)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, clean.length - 4)}-${clean.slice(clean.length - 4)}`;
};

export const validateVehicleRegistration = (regNumber) => {
  if (!regNumber || typeof regNumber !== 'string') {
    return { isValid: false, formatted: '', error: 'Vehicle registration number is required' };
  }
  const clean = regNumber.replace(/[\s-]/g, '').toUpperCase();
  // Standard Indian vehicle format e.g. KA01MJ8821 or DL1C1234
  const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
  
  if (!regex.test(clean)) {
    return {
      isValid: false,
      formatted: formatVehicleRegistration(regNumber),
      error: 'Invalid format. Use valid Indian RTO registration (e.g. KA-01-MJ-8821 or DL-01-AB-1234)',
    };
  }

  return {
    isValid: true,
    formatted: formatVehicleRegistration(regNumber),
    clean,
    error: '',
  };
};

export const validatePAN = (pan) => {
  if (!pan) return { isValid: false, error: 'PAN number is required' };
  const clean = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(clean)) {
    return { isValid: false, error: 'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)' };
  }
  return { isValid: true, clean, error: '' };
};

export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, error: 'Phone number is required' };
  const clean = phone.replace(/[^0-9]/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(clean)) {
    return { isValid: false, error: 'Invalid mobile number. Must be a 10-digit Indian phone starting with 6-9' };
  }
  return { isValid: true, clean, error: '' };
};

export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: 'Email address is required' };
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@domain.com)' };
  }
  return { isValid: true, clean, error: '' };
};

export const validateVehicleYear = (year) => {
  const currentYear = new Date().getFullYear();
  const y = parseInt(year, 10);
  if (isNaN(y) || y < 1995 || y > currentYear + 1) {
    return { isValid: false, error: `Year must be between 1995 and ${currentYear}` };
  }
  return { isValid: true, year: y, error: '' };
};
