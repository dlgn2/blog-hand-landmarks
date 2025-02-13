import RNFS from 'react-native-fs';

import { ITasks } from '@/screens/Home/LevelProgression';
import { ITask } from '@/screens/Home/TaskList';

import { storage } from '@/App';
import { IAuthResponse } from '@/services/interfaces/interfaces';

import { FetchAdapter } from '../api/FetchAdapter';

export class UserService {
  private fetchAdapter: FetchAdapter;

  constructor(fetchAdapter: FetchAdapter) {
    this.fetchAdapter = fetchAdapter;
  }

  async register(
    email: string,
    password: string,
    name: string,
    user_type: string,
    profile_photo: string
  ): Promise<IAuthResponse | null> {
    try {
      const response = await this.fetchAdapter.post<IAuthResponse>(
        '/auth/register',
        { email, password, user_type, name, profile_photo }
      );
      console.log('register response', response);
      storage.set('access_token', response.access_token);
      if (response.user_id) {
        storage.set('user_id', response.user_id);
      }
      return response;
    } catch (error: any) {
      console.warn('register error', error);
      return this.handleError(error);
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    user_id: string;
    email: string;
    access_token: string;
    token_type: string;
  } | null> {
    try {
      const response = await this.fetchAdapter.post<IAuthResponse>(
        '/auth/login',
        { email, password }
      );
      storage.set('access_token', response.access_token);
      if (response.user_id) {
        storage.set('user_id', response.user_id);
      }
      return response;
    } catch (error: any) {
      console.warn('login error', error);
      return this.handleError(error);
    }
  }

  async logout(): Promise<IAuthResponse | null> {
    try {
      const access_token = storage.getString('access_token');
      const response = await this.fetchAdapter.post<IAuthResponse>(
        '/auth/logout',
        {},
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      storage.delete('access_token');
      storage.delete('user_id');
      return response;
    } catch (error: any) {
      console.warn('logout error', error);
      return this.handleError(error);
    }
  }

  async createDemographic(
    age: number | null,
    name: string | null,
    gender: string | null,
    education_level: string | null,
    job: string | null,
    income_level: string | null,
    city: string | null,
    is_hearing_impaired: boolean | null,
    is_know_tsl: boolean | null,
    usage_frequency_tsl: string | null,
    tsl_comments: string | null,
    tsl_level: string | null
  ): Promise<{
    age: number;
    name: string;
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
  } | null> {
    const access_token = storage.getString('access_token');
    try {
      const response = await this.fetchAdapter.post<{
        age: number;
        name: string;
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
      }>(
        '/demographics',
        {
          age,
          name,
          gender,
          education_level,
          job,
          income_level,
          city,
          is_hearing_impaired,
          is_know_tsl,
          usage_frequency_tsl,
          tsl_comments,
          tsl_level,
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      return response;
    } catch (error: any) {
      console.warn('createDemographic error', error);
      return this.handleError(error);
    }
  }

  async getDemographic(): Promise<{
    id: number;
    created_at: string;
    updated_at: string;
    user_id: string;
    age: number;
    gender: string;
    education_level: string;
    job: string;
    income_level: string;
    city: string;
    is_hearing_impaired: boolean;
    is_know_tsl: boolean;
    usage_frequency_tsl: string;
  } | null> {
    const access_token = storage.getString('access_token');
    try {
      const response = await this.fetchAdapter.get<{
        id: number;
        created_at: string;
        updated_at: string;
        user_id: string;
        age: number;
        gender: string;
        education_level: string;
        job: string;
        income_level: string;
        city: string;
        is_hearing_impaired: boolean;
        is_know_tsl: boolean;
        usage_frequency_tsl: string;
      }>('/demographics', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return response;
    } catch (error: any) {
      console.warn('getDemographic error', error);
      return this.handleError(error);
    }
  }

  async getUser(): Promise<{
    email: string;
    name: string;
    user_type: string;
    user_provider: string;
    profile_photo: string;
  } | null> {
    const access_token = storage.getString('access_token');
    const user_id = storage.getNumber('user_id');
    console.log('access_token', access_token);
    console.log('user_id', user_id);
    try {
      const response = await this.fetchAdapter.get<{
        email: string;
        name: string;
        user_type: string;
        user_provider: string;
        profile_photo: string;
      }>(`/users/${user_id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return response;
    } catch (error: any) {
      console.warn('getUser error', error);
      return this.handleError(error);
    }
  }

  async updateUser(
    email?: string,
    name?: string,
    password?: string
  ): Promise<{
    email: string;
    name: string;
    user_type: string;
    user_provider: string;
    profile_photo: string;
  } | null> {
    const access_token = storage.getString('access_token');
    const user_id = storage.getNumber('user_id');
    console.log('access_token', access_token);

    try {
      // Güncellenecek veriler request body içinde gönderiliyor.
      const body: any = {};
      if (email !== undefined) body.email = email;
      if (name !== undefined) body.name = name;
      if (password !== undefined) body.password = password;

      // Burada body ve headers'ı tek bir options nesnesinde birleştiriyoruz.
      const response = await this.fetchAdapter.put<{
        email: string;
        name: string;
        user_type: string;
        user_provider: string;
        profile_photo: string;
      }>(`/users/${user_id}`, {
        body,
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return response;
    } catch (error: any) {
      console.warn('updateUser error', error);
      return this.handleError(error);
    }
  }

  async getControlMe(): Promise<{
    email: string;
    name: string;
    user_type: string;
    user_provider: string;
    profile_photo: string;
  } | null> {
    const access_token = storage.getString('access_token');
    try {
      const response = await this.fetchAdapter.get<{
        email: string;
        name: string;
        user_type: string;
        user_provider: string;
        profile_photo: string;
      }>(`/users/control/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return response;
    } catch (error: any) {
      console.warn('getControlMe error', error);
      return this.handleError(error);
    }
  }

  async getPrizesMe(): Promise<
    { is_used: boolean; amount: number; code: string }[] | null
  > {
    const access_token = storage.getString('access_token');
    try {
      const response = await this.fetchAdapter.get<
        { is_used: boolean; amount: number; code: string }[]
      >(`/users/prizes/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return response;
    } catch (error: any) {
      console.warn('getPrizesMe error', error);
      return this.handleError(error);
    }
  }

  async getProgressMe(): Promise<ITask | null> {
    const access_token = storage.getString('access_token');
    try {
      const response = await this.fetchAdapter.get<ITask>(
        `/users/progress/me`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      return response;
    } catch (error: any) {
      console.warn('getProgressMe error', error);
      return this.handleError(error);
    }
  }

  async getProgressLeaderBoard(): Promise<{} | null> {
    const access_token = storage.getString('access_token');
    try {
      const response = await this.fetchAdapter.get<{}>(
        `/users/progress/leaderboard`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      return response;
    } catch (error: any) {
      console.warn('getProgressLeaderBoard error', error);
      return this.handleError(error);
    }
  }

  async getProgressAll(): Promise<ITasks[] | null> {
    const access_token = storage.getString('access_token');
    console.log('access_token', access_token);
    try {
      const response = await this.fetchAdapter.get<ITasks[]>(
        `/users/progress/all`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      return response;
    } catch (error: any) {
      console.warn('getProgressAll error', error);
      return this.handleError(error);
    }
  }

  async uploadVideo(
    sign_word_id: number,
    fileUri: string,
    duration: number | null
  ): Promise<any | null> {
    const access_token = storage.getString('access_token');
    console.log('sign_word_id', sign_word_id);
    // Video yükleme işlemi için FormData hazırlanıyor.
    const formData = new FormData();
    formData.append('sign_word_id', sign_word_id.toString());
    formData.append(
      'duration',
      (parseInt(duration?.toString() ?? '0') || 0).toString()
    );

    const fileName = fileUri.split('/').pop() || 'video.mp4';
    const fileType = 'video/mp4';

    formData.append('file', {
      uri: fileUri,
      type: fileType,
      name: fileName,
    } as any);

    try {
      const response = await this.fetchAdapter.post(
        `/videos/upload`,
        formData,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      return response;
    } catch (error: any) {
      console.warn('uploadVideo error', error);
      return this.handleError(error);
    }
  }

  async myVideos(): Promise<{
    id: number;
    sign_word_id: number;
    file: string;
    created_at: string;
    updated_at: string;
  } | null> {
    const access_token = storage.getString('access_token');
    try {
      const response = await this.fetchAdapter.get<{
        id: number;
        sign_word_id: number;
        file: string;
        created_at: string;
        updated_at: string;
      }>(`/videos/my-videos`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return response;
    } catch (error: any) {
      console.warn('myVideos error', error);
      return this.handleError(error);
    }
  }

  async sendOtp(email: string): Promise<any | null> {
    try {
      const response = await this.fetchAdapter.post(
        `/auth/send-otp?email=${encodeURIComponent(email)}`
      );
      console.log('sendOtp response', response);
      return response;
    } catch (error: any) {
      console.warn('sendOtp error', error);
      return this.handleError(error);
    }
  }

  async verifyOtp(email: string, otp: string): Promise<any | null> {
    try {
      const response = await this.fetchAdapter.post(
        `/auth/verify-otp?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(otp)}`,
        { email, otp }
      );
      console.log('verifyOtp response', response);
      return response;
    } catch (error: any) {
      console.warn('verifyOtp error', error);
      return this.handleError(error);
    }
  }

  async resetPassword(
    email: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<any | null> {
    try {
      const response = await this.fetchAdapter.post(
        `auth/reset-password?email=${encodeURIComponent(
          email
        )}&new_password=${encodeURIComponent(
          newPassword
        )}&confirm_password=${encodeURIComponent(confirmPassword)}`
      );
      return response;
    } catch (error: any) {
      console.warn('resetPassword error', error);
      return this.handleError(error);
    }
  }

  // handleError: Hata durumlarını loglar ve uygulamanın crash etmesini engellemek için null döndürür.
  private handleError(error: any): null {
    if (error.response) {
      console.error('Error Response:', error.response.data?.message);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return null;
  }
}
