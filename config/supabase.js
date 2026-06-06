import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Uploads a file buffer from Multer directly to any Supabase Storage bucket
 * @param {Buffer} fileBuffer - The file buffer provided by req.file.buffer
 * @param {string} fileName - The unique name generated for the file
 * @param {string} mimeType - The file's format type (e.g., 'image/jpeg')
 * @param {string} bucketName - The target storage bucket ('variant' or 'profile')
 */
export const uploadToSupabase = async (fileBuffer, fileName, mimeType, bucketName) => {
  // Dynamically set folder path based on the bucket name
  // variant bucket gets: ksms/products/filename.jpg
  // profile bucket gets: ksms/profiles/filename.jpg
  const folder = bucketName === 'profile' ? 'ksms/profiles' : 'ksms/products';
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage Upload Error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};