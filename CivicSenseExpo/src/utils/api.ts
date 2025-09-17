import { Platform } from 'react-native';

const API_BASE_URL = 'http://192.168.1.8:4000';

export interface PhotoObject {
  url: string;
  caption: string;
  fileName: string;
  type: string;
  size: number;
}

export const uploadPhotos = async (photoUris: string[]): Promise<PhotoObject[]> => {
  try {
    const formData = new FormData();
    
    photoUris.forEach((uri, index) => {
      formData.append('photos', {
        uri: uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}_${index}.jpg`,
      } as any);
    });

    const response = await fetch(`${API_BASE_URL}/api/reports/upload-photos`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload photos');
    }

    return data.photos;
  } catch (error) {
    console.error('Photo upload error:', error);
    throw error;
  }
};

export const submitReport = async (reportData: {
  title: string;
  category: string;
  description: string;
  locationText?: string;
  latitude?: number;
  longitude?: number;
  photos: PhotoObject[];
  voiceNoteUrl?: string;
  department: string;
  reporterEmail?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit report');
    }

    return data;
  } catch (error) {
    console.error('Report submission error:', error);
    throw error;
  }
};
