// Termii SMS API Utility Placeholder

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (phoneNumber: string, otp: string) => {
  const apiKey = process.env.TERMII_API_KEY;
  console.log(`[Termii Placeholder] Sending OTP ${otp} to ${phoneNumber} using key ${apiKey}`);
  // TODO: Implement actual Termii HTTP request
  return true;
};

export const verifyOtp = async (phoneNumber: string, inputOtp: string, expectedOtp: string) => {
  return inputOtp === expectedOtp;
};
