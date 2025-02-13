import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class FetchAdapter {
  private httpClient: AxiosInstance;
  private streamHttpClient: AxiosInstance;

  constructor(baseURL: string) {
    this.httpClient = axios.create({
      baseURL,
      headers: {
        // Remove 'Content-Type' from here
        'Accept-Encoding': 'gzip, deflate, br',
        Accept: 'application/json, text/plain, */*',
      },
      withCredentials: true,
    });

    this.streamHttpClient = axios.create({
      baseURL,
      responseType: 'stream',
      headers: {
        // Remove 'Content-Type' from here
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      withCredentials: true,
    });
  }

  async get<T>(
    url: string,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.httpClient.get(url, options);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    let headers = options?.headers || {};

    if (data instanceof FormData) {
      // Let Axios set the 'Content-Type' header automatically
      headers = { ...headers };
    } else {
      // For JSON data, set the 'Content-Type' header
      headers = { 'Content-Type': 'application/json', ...headers };
    }

    const response: AxiosResponse<T> = await this.httpClient.post(url, data, {
      headers,
    });
    return response.data;
  }

  async postStream<T>(url: string, data: any): Promise<T> {
    const response: AxiosResponse<T> = await this.streamHttpClient.post(
      url,
      data
    );
    return response.data;
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response: AxiosResponse<T> = await this.httpClient.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.httpClient.delete(url);
    return response.data;
  }
}
