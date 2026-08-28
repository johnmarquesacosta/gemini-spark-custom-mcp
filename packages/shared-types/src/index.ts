export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export interface AiAgentDto {
  id: string;
  name: string;
  scopes: string[];
  lastUsedAt: Date | string | null;
  createdAt: Date | string;
}

export interface CreateAiAgentRequest {
  name: string;
  scopes: string[];
}

export interface CreateAiAgentResponse {
  agent: AiAgentDto;
  apiKey: string; // Only returned once
}
