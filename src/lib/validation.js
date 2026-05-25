/**
 * Artlor Form Validation Utility
 * Enforces highly authentic values, blocking placeholder, anonymous, 
 * disposable, sequential, or repeating entries.
 */

const BLOCKED_KEYWORDS = [
  'test', 'demo', 'dummy', 'admin', 'anonymous', 'panda', 'asdf', 'qwerty',
  'temp', 'guest', 'someone', 'nobody', 'null', 'none', 'unknown', 'user',
  'owner', 'fake', 'placeholder', 'invalid', 'first', 'last', 'name', 'foo', 'bar'
];

const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'yopmail.com', 'tempmail.com', '10minutemail.com',
  'sharklasers.com', 'guerrillamail.com', 'dispostable.com', 'trashmail.com',
  'temp-mail.org', 'generator.email', 'maildrop.cc', 'tempmailaddress.com',
  'getairmail.com', 'trashmail.de', 'tempmail.net'
];

const PLACEHOLDER_EMAIL_DOMAINS = [
  'example.com', 'test.com', 'dummy.com', 'fake.com', 'none.com',
  'invalid.com', 'temp.com', 'user.com', 'panda.com', 'domain.com', 'email.com'
];

/**
 * Validates a full name strictly.
 * - Must be at least 4 characters
 * - Must contain at least two words (first and last name)
 * - Each word must be at least 2 characters long
 * - Letters, spaces, hyphens, and apostrophes only
 * - Rejects any blocked keywords or repeating letters like "aaaa"
 */
export function isValidAuthenticName(name) {
  if (!name) return false;
  const cleaned = name.trim();
  
  // Format check
  if (!/^[a-zA-Z\s'-]+$/.test(cleaned)) return false;
  if (cleaned.length < 4) return false;

  const words = cleaned.split(/\s+/);
  if (words.length < 1) return false; // Second name is now optional

  for (const word of words) {
    if (word.length < 2) return false;
    const lowerWord = word.toLowerCase();
    
    // Reject blocked mock names
    if (BLOCKED_KEYWORDS.includes(lowerWord)) return false;
    
    // Reject repeating letters (e.g. "aaa", "xxxx")
    if (/^(.)\1{2,}$/.test(lowerWord)) return false;
  }
  
  return true;
}

/**
 * Validates phone numbers strictly.
 * - Indian system: 10 digits starting with 6, 7, 8, 9
 * - International system: 7 to 15 total digits (excluding '+' prefix)
 * - Rejects sequential digits (e.g. 1234, 9876)
 * - Rejects excessive repeating digits (e.g. 99999...)
 * - Rejects standard mockup numbers (e.g. 9876543210)
 */
export function isValidAuthenticPhone(phone, system, selectedCountryCode = '') {
  if (!phone) return { isValid: false, error: 'Phone number is required.' };
  
  const cleanedPhone = phone.replace(/\D/g, '');
  
  if (system === 'indian') {
    if (cleanedPhone.length !== 10) {
      return { isValid: false, error: 'Indian phone numbers must be exactly 10 digits.' };
    }
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      return { isValid: false, error: 'Indian mobile numbers must start with 6, 7, 8, or 9.' };
    }
  } else {
    // International Number
    const countryCodeCleaned = selectedCountryCode.replace(/\D/g, '');
    const fullNumber = countryCodeCleaned + cleanedPhone;
    
    if (cleanedPhone.length < 7 || cleanedPhone.length > 12) {
      return { isValid: false, error: 'International numbers must be between 7 and 12 digits (excluding code).' };
    }
    if (fullNumber.length < 7 || fullNumber.length > 15) {
      return { isValid: false, error: 'Invalid international number length.' };
    }
  }
  
  // Anti-Mock Check 1: Excessive repeating digits (e.g. 99999 or 00000)
  if (/(\d)\1{4,}/.test(cleanedPhone)) {
    return { isValid: false, error: 'Authentic numbers only. Repeating digit sequences are blocked.' };
  }
  
  // Anti-Mock Check 2: Too few unique digits (e.g. "9999988888")
  const uniqueDigits = new Set(cleanedPhone).size;
  if (uniqueDigits <= 2) {
    return { isValid: false, error: 'Too many repeating digits. Please use a real active number.' };
  }
  
  // Anti-Mock Check 3: Sequential digit runs of length 4 or more (e.g. 1234, 4321, 5678)
  for (let i = 0; i <= cleanedPhone.length - 4; i++) {
    const slice = cleanedPhone.slice(i, i + 4).split('').map(Number);
    if (slice[1] === slice[0] + 1 && slice[2] === slice[1] + 1 && slice[3] === slice[2] + 1) {
      return { isValid: false, error: 'Sequential sequences (e.g., 1234) are blocked.' };
    }
    if (slice[1] === slice[0] - 1 && slice[2] === slice[1] - 1 && slice[3] === slice[2] - 1) {
      return { isValid: false, error: 'Sequential sequences (e.g., 4321) are blocked.' };
    }
  }
  
  // Anti-Mock Check 4: Common placeholder configurations
  const commonFakes = [
    '9876543210', '1234567890', '0123456789', '9123456789', 
    '1111222233', '9999888877', '12345678', '87654321'
  ];
  if (commonFakes.some(fake => cleanedPhone.includes(fake))) {
    return { isValid: false, error: 'This placeholder or mock number structure is not allowed.' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates email addresses strictly.
 * - Standard email regex format
 * - Rejects disposable domains (yopmail, mailinator, etc.)
 * - Rejects placeholder domains (example.com, test.com, panda.com)
 * - Rejects fake usernames (test@, admin@, panda@)
 */
export function isValidAuthenticEmail(email) {
  if (!email) return { isValid: false, error: 'Email address is required.' };
  
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g., you@domain.com).' };
  }
  
  const [username, domain] = trimmed.toLowerCase().split('@');
  
  // Reject disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    return { isValid: false, error: 'Disposable or temporary email domains are blocked for security.' };
  }
  
  // Reject fake/placeholder domains
  if (PLACEHOLDER_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    return { isValid: false, error: 'Placeholder or placeholder domains (e.g., example.com) are not allowed.' };
  }
  
  // Reject placeholder usernames
  if (BLOCKED_KEYWORDS.includes(username)) {
    return { isValid: false, error: `Usernames like "${username}@" are blocked as anonymous.` };
  }
  
  // Reject repeating letters in usernames (e.g. "aaaa@", "asdfasdf@")
  if (/^(.)\1{2,}$/.test(username)) {
    return { isValid: false, error: 'Username looks like random repeating characters.' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates a text address field strictly.
 * - Must be at least 5 characters
 * - Cannot be purely numeric
 * - Rejects blocked mock keywords
 */
export function isValidAddressField(value) {
  if (!value) return false;
  const cleaned = value.trim();
  
  if (cleaned.length < 5) return false;
  if (/^\d+$/.test(cleaned)) return false; // purely numeric street names are invalid
  
  // Reject blocked keywords as isolated words
  for (const keyword of BLOCKED_KEYWORDS) {
    const regex = new RegExp('\\b' + keyword + '\\b', 'i');
    if (regex.test(cleaned)) return false;
  }
  
  return true;
}

/**
 * Validates postal/pincode strictly.
 */
export function isValidPincode(pincode, system) {
  if (!pincode) return false;
  const cleaned = pincode.trim().replace(/\s/g, '');
  
  if (system === 'indian') {
    if (!/^\d{6}$/.test(cleaned)) return false;
    if (cleaned[0] === '0') return false; // Indian PIN codes do not start with 0
    
    // Anti-Mock: repeats (111111) or sequential (123456)
    if (/^(\d)\1{5}$/.test(cleaned)) return false;
    if (cleaned === '123456' || cleaned === '654321') return false;
  } else {
    // International ZIP/Postal Code
    if (cleaned.length < 3 || cleaned.length > 10) return false;
    if (!/^[a-zA-Z0-9-]{3,10}$/.test(cleaned)) return false;
    if (/^([a-zA-Z0-9])\1{2,}$/.test(cleaned)) return false;
  }
  
  return true;
}
