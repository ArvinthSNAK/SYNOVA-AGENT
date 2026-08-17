// SYNOVA — Insurance Application Validation Utilities

// ─── Vehicle Registration Number ──────────────────────────────────────────────
// Standard Indian vehicle registration: XX-00-XX-0000 or XX-00-0000
const REGISTRATION_REGEX = /^[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{0,3}[-\s]?\d{1,4}$/i;

export function validateRegistrationNumber(value) {
  if (!value || !value.trim()) return { valid: false, message: 'Registration number is required.' };
  const clean = value.trim().toUpperCase();
  if (!REGISTRATION_REGEX.test(clean)) {
    return {
      valid: false,
      message: 'Enter a valid Indian registration number (e.g., KA-01-XX-0000).',
    };
  }
  return { valid: true, message: '' };
}

// ─── Manufacturing Year ───────────────────────────────────────────────────────
export function validateYear(value) {
  if (!value) return { valid: false, message: 'Manufacturing year is required.' };
  const year = parseInt(value, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1990 || year > currentYear + 1) {
    return {
      valid: false,
      message: `Year must be between 1990 and ${currentYear + 1}.`,
    };
  }
  return { valid: true, message: '' };
}

// ─── Required Field ───────────────────────────────────────────────────────────
export function validateRequired(value, fieldName) {
  if (!value || !String(value).trim()) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: '' };
}

// ─── Vehicle Form Validation ──────────────────────────────────────────────────
export function validateVehicleForm(vehicle) {
  const errors = {};

  const regResult = validateRegistrationNumber(vehicle.registrationNumber);
  if (!regResult.valid) errors.registrationNumber = regResult.message;

  const makeResult = validateRequired(vehicle.make, 'Vehicle make');
  if (!makeResult.valid) errors.make = makeResult.message;

  const modelResult = validateRequired(vehicle.model, 'Vehicle model');
  if (!modelResult.valid) errors.model = modelResult.message;

  const yearResult = validateYear(vehicle.year);
  if (!yearResult.valid) errors.year = yearResult.message;

  const fuelResult = validateRequired(vehicle.fuelType, 'Fuel type');
  if (!fuelResult.valid) errors.fuelType = fuelResult.message;

  const cityResult = validateRequired(vehicle.city, 'Registration city');
  if (!cityResult.valid) errors.city = cityResult.message;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── Coverage Validation ──────────────────────────────────────────────────────
export function validateCoverage(coverage) {
  if (!coverage.type) {
    return { valid: false, message: 'Please select a coverage type.' };
  }
  return { valid: true, message: '' };
}

// ─── Field status helper ──────────────────────────────────────────────────────
// Returns: 'complete' | 'required' | 'review'
export function getFieldStatus(value, isRequired = true) {
  if (!value || !String(value).trim()) {
    return isRequired ? 'required' : 'optional';
  }
  return 'complete';
}

// ─── Application completeness check ──────────────────────────────────────────
export function isVehicleComplete(vehicle) {
  return (
    vehicle.registrationNumber &&
    vehicle.make &&
    vehicle.model &&
    vehicle.year &&
    vehicle.fuelType &&
    vehicle.city
  );
}

export function isCoverageComplete(coverage) {
  return !!coverage.type;
}
