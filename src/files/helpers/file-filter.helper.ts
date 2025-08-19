import { ValidationCallback } from '../../common/interfaces';
import {
  ALLOWED_FILE_TYPES,
  extractFileExtension,
  isValidFileExtension,
} from './file-extension.helper';
import {
  BadRequestException,
  UnsupportedMediaTypeException,
  PayloadTooLargeException,
} from '@nestjs/common';
import * as multer from 'multer';

export const multerStorage = multer.memoryStorage();

export const multerLimits = {
  fileSize: 20 * 1024 * 1024, // 20MB límite general
};

export const FileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: ValidationCallback,
  allowedTypes: string[] = ALLOWED_FILE_TYPES.ALL,
): void => {
  if (!file) {
    throw new BadRequestException('File is not provided');
  }

  try {
    const fileExtension = extractFileExtension(file);
    if (!isValidFileExtension(fileExtension, allowedTypes)) {
      throw new UnsupportedMediaTypeException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    callback(null, true);
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof UnsupportedMediaTypeException ||
      error instanceof PayloadTooLargeException
    ) {
      callback(error, false);
    } else {
      callback(new BadRequestException('An unexpected error occurred'), false);
    }
  }
};

export const createFileFilter =
  (allowedTypes: string[] = ALLOWED_FILE_TYPES.IMAGES) =>
  (
    req: Express.Request,
    file: Express.Multer.File,
    callback: ValidationCallback,
  ) =>
    FileFilter(req, file, callback, allowedTypes);

export const MulterConfigs = {
  IMAGES: {
    storage: multerStorage,
    fileFilter: createFileFilter(ALLOWED_FILE_TYPES.IMAGES),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB para imágenes
    },
  },
  DOCUMENTS: {
    storage: multerStorage,
    fileFilter: createFileFilter(ALLOWED_FILE_TYPES.DOCUMENTS),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB para documentos
    },
  },
  PDFS: {
    storage: multerStorage,
    fileFilter: createFileFilter(['pdf']),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB para PDFs
    },
  },
  ALL: {
    storage: multerStorage,
    fileFilter: createFileFilter(ALLOWED_FILE_TYPES.ALL),
    limits: multerLimits,
  },
};

export const FileFilters = {
  IMAGES: createFileFilter(ALLOWED_FILE_TYPES.IMAGES),
  DOCUMENTS: createFileFilter(ALLOWED_FILE_TYPES.DOCUMENTS),
  PDFS: createFileFilter(['pdf']),
  ALL: createFileFilter(ALLOWED_FILE_TYPES.ALL),
};
