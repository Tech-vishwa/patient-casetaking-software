export interface AbhaVerificationResult {
  valid: boolean;
  message: string;
  patientInfo?: {
    fullName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
    abhaId: string;
  };
}

export interface OtpGenerationResult {
  success: boolean;
  txnId: string;
  maskedPhone: string;
  mockOtp: string;
  message: string;
}

export class MockAbhaService {
  /**
   * Validates format of ABHA ID (14 digits, optional dashes like 12-3456-7890-1234)
   */
  static validateAbhaFormat(abha: string): boolean {
    const clean = abha.replace(/[^0-9]/g, '');
    return clean.length === 14;
  }

  /**
   * Formats raw digits into XX-XXXX-XXXX-XXXX
   */
  static formatAbha(raw: string): string {
    const clean = raw.replace(/[^0-9]/g, '').slice(0, 14);
    const parts: string[] = [];
    if (clean.length > 0) parts.push(clean.slice(0, 2));
    if (clean.length > 2) parts.push(clean.slice(2, 6));
    if (clean.length > 6) parts.push(clean.slice(6, 10));
    if (clean.length > 10) parts.push(clean.slice(10, 14));
    return parts.join('-');
  }

  /**
   * Simulates ABDM Gateway OTP request
   */
  static async requestOtp(abhaOrPhone: string): Promise<OtpGenerationResult> {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulating network latency

    const clean = abhaOrPhone.replace(/[^0-9]/g, '');
    if (clean.length !== 14 && clean.length !== 10) {
      return {
        success: false,
        txnId: '',
        maskedPhone: '',
        mockOtp: '',
        message: 'Invalid ABHA Number or Mobile Number length.',
      };
    }

    const mockOtp = '123456';
    const txnId = 'txn-' + Math.random().toString(36).substring(2, 8);
    const last4 = clean.slice(-4);
    const maskedPhone = `XXXXXX${last4}`;

    return {
      success: true,
      txnId,
      maskedPhone,
      mockOtp,
      message: `OTP sent to linked mobile ${maskedPhone} (Demo OTP: ${mockOtp})`,
    };
  }

  /**
   * Simulates ABDM Gateway OTP Verification
   */
  static async verifyOtp(
    abhaOrPhone: string,
    otp: string,
    _txnId: string
  ): Promise<AbhaVerificationResult> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (otp !== '123456') {
      return {
        valid: false,
        message: 'Incorrect OTP. Please enter 123456 for demo.',
      };
    }

    const clean = abhaOrPhone.replace(/[^0-9]/g, '');
    const formattedAbha = clean.length === 14 
      ? this.formatAbha(clean) 
      : '91-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);

    return {
      valid: true,
      message: 'ABHA Authentication successful.',
      patientInfo: {
        fullName: 'Ramesh Sundaram',
        age: 58,
        gender: 'male',
        phone: clean.length === 10 ? clean : '9840129876',
        abhaId: formattedAbha,
      },
    };
  }
}
