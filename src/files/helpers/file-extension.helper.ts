// Funciones de utilidad para el manejo de extensiones de archivos

export const ALLOWED_FILE_TYPES: {
  IMAGES: string[];
  DOCUMENTS: string[];
  AUDIO: string[];
  VIDEO: string[];
  ALL: string[];
} = {
  IMAGES: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  AUDIO: ['mp3', 'wav', 'ogg'],
  VIDEO: ['mp4', 'webm', 'avi'],
  ALL: [],
};

ALLOWED_FILE_TYPES.ALL = [
  ...ALLOWED_FILE_TYPES.IMAGES,
  ...ALLOWED_FILE_TYPES.DOCUMENTS,
  ...ALLOWED_FILE_TYPES.AUDIO,
  ...ALLOWED_FILE_TYPES.VIDEO,
];

export const extractFileExtension = (file: Express.Multer.File): string => {
  if (!file?.mimetype) {
    throw new Error('Invalid MIME type: File MIME type is missing');
  }

  const mimeParts = file.mimetype.split('/');
  if (mimeParts.length !== 2 || !mimeParts[1]) {
    throw new Error(`Invalid MIME type format: ${file.mimetype}`);
  }

  return mimeParts[1];
};

export const isValidFileExtension = (
  extension: string,
  allowedExtensions: string[] = ALLOWED_FILE_TYPES.IMAGES,
): boolean => allowedExtensions.includes(extension.toLowerCase());

export const getFileType = (extension: string): string => {
  const lowerExt = extension.toLowerCase();
  if (ALLOWED_FILE_TYPES.IMAGES.includes(lowerExt)) return 'image';
  if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(lowerExt)) return 'document';
  if (ALLOWED_FILE_TYPES.AUDIO.includes(lowerExt)) return 'audio';
  if (ALLOWED_FILE_TYPES.VIDEO.includes(lowerExt)) return 'video';
  return 'unknown';
};

export const sanitizeFileExtension = (extension: string): string => {
  const sanitizedExtension = extension.trim().replace(/[^a-zA-Z0-9]/g, '');
  if (!sanitizedExtension) {
    throw new Error('Invalid file extension: Contains only invalid characters');
  }
  return sanitizedExtension;
};
