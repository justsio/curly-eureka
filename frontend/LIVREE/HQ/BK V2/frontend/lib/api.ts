import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Winner {
  id: string;
  name: string;
  phone_masked: string;
  prize_amount: string;
  campaign_name?: string;
  created_at: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  participantId?: string;
  error?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface TrackShareResponse {
  success: boolean;
  message: string;
}

export const apiService = {
  getWinners: async (): Promise<Winner[]> => {
    const response = await api.get<{ success: boolean; winners: Winner[] }>('/api/winners');
    return response.data.winners;
  },

  register: async (phone: string, entryCode: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/register', {
      phone,
      entryCode,
    });
    return response.data;
  },

  verifyOTP1: async (
    participantId: string,
    phone: string,
    entryCode: string,
    otp1Code: string
  ): Promise<VerifyOTPResponse> => {
    const response = await api.post<VerifyOTPResponse>('/api/verify-otp1', {
      participantId,
      phone,
      entryCode,
      otp1Code,
    });
    return response.data;
  },

  verifyOTP2: async (
    participantId: string,
    phone: string,
    entryCode: string,
    otp1Code: string,
    otp2Code: string
  ): Promise<VerifyOTPResponse> => {
    const response = await api.post<VerifyOTPResponse>('/api/verify-otp2', {
      participantId,
      phone,
      entryCode,
      otp1Code,
      otp2Code,
    });
    return response.data;
  },

  trackShare: async (participantId: string, platform: string): Promise<TrackShareResponse> => {
    const response = await api.post<TrackShareResponse>('/api/track-share', {
      participantId,
      platform,
    });
    return response.data;
  },
};
