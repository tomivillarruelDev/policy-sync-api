import { v4 as uuid } from 'uuid';
import {
  extractFileExtension,
  sanitizeFileExtension,
} from './file-extension.helper';

export const generateUniqueFileName = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string | boolean) => void,
  useOriginalName: boolean = false,
): void => {
  if (!file) return callback(new Error('File is not provided'), false);

  try {
    const fileExtension = sanitizeFileExtension(extractFileExtension(file));
    const newFileName =
      useOriginalName && file.originalname
        ? `${sanitizeOriginalName(file.originalname)}-${uuid().substring(0, 8)}.${fileExtension}`
        : `${uuid()}.${fileExtension}`;

    callback(null, newFileName);
  } catch (error) {
    callback(error as Error, false);
  }
};

export const generateStructuredFileName = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string | boolean) => void,
): void => {
  if (!file) return callback(new Error('File is not provided'), false);

  try {
    const fileExtension = sanitizeFileExtension(extractFileExtension(file));
    const date = new Date();
    const path = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const fileName = `${uuid()}.${fileExtension}`;

    callback(null, `${path}/${fileName}`);
  } catch (error) {
    callback(error as Error, false);
  }
};

const sanitizeOriginalName = (originalName: string): string => {
  return originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
};
