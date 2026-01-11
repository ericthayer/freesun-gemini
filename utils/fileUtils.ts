
/**
 * Validates an image file based on type and size.
 * @param file The file to validate
 * @param maxSizeInMB Maximum allowed size in megabytes
 * @returns { valid: boolean, error: string | null }
 */
export const validateImageFile = (file: File, maxSizeInMB: number = 5): { valid: boolean; error: string | null } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.`,
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File is too large. Maximum allowed size is ${maxSizeInMB}MB.`,
    };
  }

  return { valid: true, error: null };
};
