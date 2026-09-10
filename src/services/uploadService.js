import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];

export const uploadService = {
  /**
   * Validate file size and type before upload
   */
  validateImage(file) {
    if (!file) {
      throw new Error('No file selected.');
    }
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      throw new Error('Please select a valid image file (JPEG, PNG, or WebP).');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size exceeds 5MB. Please choose a smaller photo.');
    }
    return true;
  },

  /**
   * Upload an image file to Supabase Storage and return public URL
   */
  async uploadPhoto(file, bucketName = 'issue-images', userId = 'anonymous') {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase storage is not configured. Please add .env credentials.');
    }

    this.validateImage(file);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`Storage upload error in ${bucketName}:`, error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }
};

export default uploadService;
