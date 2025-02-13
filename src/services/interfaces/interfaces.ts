export interface IAuthResponse {
  user_id: string;
  email: string;
  access_token: string;
  token_type: string;
}

export interface IDemographic {
  age: number;
  gender: string;
  education_level: string;
  job: string;
  income_level: string;
  city: string;
  is_hearing_impaired: boolean;
  is_know_tsl: boolean;
  usage_frequency_tsl: string;
  tsl_comments: string;
  tsl_level: string;
}
