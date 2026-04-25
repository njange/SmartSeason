import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

let configured = false;

function configureCloudinary(): void {
  if (configured) {
    return;
  }

  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new AppError('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.', 500);
  }

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true
  });

  configured = true;
}

export async function uploadImageToCloudinary(input: {
  buffer: Buffer;
  mimeType: string;
  fieldId: string;
}): Promise<string> {
  configureCloudinary();

  const payload = `data:${input.mimeType};base64,${input.buffer.toString('base64')}`;
  const upload = await cloudinary.uploader.upload(payload, {
    folder: 'shamba/field-images',
    resource_type: 'image',
    public_id: `${input.fieldId}-${Date.now()}`,
    overwrite: false
  });

  return upload.secure_url;
}
