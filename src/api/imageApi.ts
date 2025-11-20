import { api } from "./client";


interface ImageUploadResponse {
  message: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

interface ImageMultipleUploadResponse {
  message: string;
  files: Array<{
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  }>;
}

interface ImageMetadata {
  filename: string;
  url: string;
  size: number;
  created: string;
  modified: string;
}

interface ImageListResponse {
  count: number;
  images: ImageMetadata[];
}

interface ImageDeleteResponse {
  message: string;
  filename: string;
}

interface ImageMultipleDeleteResponse {
  message: string;
  results: {
    deleted: string[];
    notFound: string[];
    errors: string[];
  };
}


export class ImageAPI {
  private adminPassword: string;

  constructor(adminPassword?: string) {
    this.adminPassword = adminPassword || '';
  }
  
  setAdminPassword(password: string) {
    this.adminPassword = password;
  }
  
  async upload(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return await api.post<ImageUploadResponse>('/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-admin-password': this.adminPassword
      }
    });
  }

  async uploadMultiple(files: File[]): Promise<ImageMultipleUploadResponse> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('image', file);
    });

    return await api.post<ImageMultipleUploadResponse>('/image/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-admin-password': this.adminPassword
      }
    });
  }


  async list(): Promise<ImageListResponse> {
    return await api.get<ImageListResponse>('/image');
  }


  getImageUrl(filename: string): string {
    return `${api['client'].defaults.baseURL}/image/${filename}`;
  }

  getImageSrc(filename: string): string {
    return this.getImageUrl(filename);
  }

  async delete(filename: string): Promise<ImageDeleteResponse> {
    return await api.delete<ImageDeleteResponse>(`/image/${filename}`, undefined, {
      headers: {
        'x-admin-password': this.adminPassword
      }
    });
  }

  async deleteMultiple(filenames: string[]): Promise<ImageMultipleDeleteResponse> {
    return await api.delete<ImageMultipleDeleteResponse>('/image', undefined, {
      headers: {
        'x-admin-password': this.adminPassword
      },
      data: { filenames }
    });
  }
  
  async uploadWithPreview(file: File, onProgress?: (percent: number) => void): Promise<ImageUploadResponse> {
    // Validação de tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use: jpeg, jpg, png, gif ou webp');
    }
    
    const maxSize = 5 * 1024 * 1024; // (5MB)
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
    }

    const formData = new FormData();
    formData.append('image', file);

    return await api.post<ImageUploadResponse>('/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-admin-password': this.adminPassword
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
  }
  
  async search(query: string): Promise<ImageMetadata[]> {
    const allImages = await this.list();
    return allImages.images.filter(img => 
      img.filename.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  async exists(filename: string): Promise<boolean> {
    try {
      const response = await fetch(this.getImageUrl(filename), { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}