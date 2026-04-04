type AuthContext = {
  ipAddress?: string;
  userAgent?: string;
};

type SessionData = {
  refreshToken: String;
  jwt: String;
};

type SendOtpResponse = {
  otpId: string;
};

export type { AuthContext , SessionData , SendOtpResponse  };