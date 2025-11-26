import axios, { 
    type AxiosInstance, 
    type AxiosRequestConfig, 
    type AxiosResponse 
} from 'axios';


// const MONGODB_BASE_URL = "http://localhost:3000/api/v1"
const MONGODB_BASE_URL = "/api/v1"


class ApiClient {

  private client: AxiosInstance;

  constructor(baseURL: string = MONGODB_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      withCredentials: true
    });
  }
  
  private async request<T>(method: string, url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.request({ method, url, ...config });
    return response.data;
  }
  
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, { params, ...config });
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', url, { data, ...config });
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, { data, ...config });
  }
  
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, { data, ...config });
  }
  
  async delete<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, { params, ...config });
  }
  
  async upload<T>(url: string, file: File | Blob, fieldName = 'file', config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.request<T>('POST', url, {
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    });
  }

}

export const api = new ApiClient();

