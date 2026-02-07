import imageCompression from 'browser-image-compression';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

// Log config at startup (without sensitive data)
console.log('[Cloudinary] Config loaded:', { 
  cloudName: CLOUD_NAME ? `${CLOUD_NAME.slice(0, 4)}...` : 'NOT SET',
  preset: UPLOAD_PRESET ? `${UPLOAD_PRESET.slice(0, 6)}...` : 'NOT SET'
});

export async function compressImage(file: File | Blob): Promise<Blob> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    initialQuality: 0.8,
  } as any;

  const fileToCompress = file instanceof File ? file : new File([file], 'image.jpg', { type: 'image/jpeg' });
  console.log('[Cloudinary] Compressing image:', fileToCompress.name, 'Original size:', (fileToCompress.size / 1024).toFixed(1), 'KB');
  
  const compressed = await imageCompression(fileToCompress, options);
  console.log('[Cloudinary] Compressed size:', (compressed.size / 1024).toFixed(1), 'KB');
  
  return compressed;
}

export async function uploadImage(file: File | Blob): Promise<string> {
  // Validate config
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary CLOUD_NAME is not configured. Add VITE_CLOUDINARY_CLOUD_NAME to your .env file.');
  }
  if (!UPLOAD_PRESET) {
    throw new Error('Cloudinary UPLOAD_PRESET is not configured. Add VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
  }

  try {
    // Compress the image first
    const compressed = await compressImage(file);
    
    // Prepare form data
    const form = new FormData();
    form.append('file', compressed);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', 'iray-lalana'); // Optional: organize uploads in a folder

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    console.log('[Cloudinary] Uploading to:', uploadUrl);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: form,
    });

    const responseText = await res.text();
    
    if (!res.ok) {
      console.error('[Cloudinary] Upload failed:', res.status, responseText);
      // Try to parse error message
      try {
        const errorJson = JSON.parse(responseText);
        throw new Error(errorJson.error?.message || `Upload failed (${res.status})`);
      } catch {
        throw new Error(`Upload failed: ${res.status}`);
      }
    }

    const json = JSON.parse(responseText);
    console.log('[Cloudinary] Upload successful:', {
      url: json.secure_url,
      publicId: json.public_id,
      format: json.format,
      size: json.bytes
    });

    const imageUrl = json.secure_url || json.url;
    if (!imageUrl) {
      throw new Error('Cloudinary returned no URL');
    }

    return imageUrl;
  } catch (error: any) {
    console.error('[Cloudinary] Upload error:', error);
    throw error;
  }
}
