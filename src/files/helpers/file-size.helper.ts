export const FILE_SIZE = Object.freeze({
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PDF_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024, // 20MB
});

export const FILE_EXTENSIONS = Object.freeze({
  IMAGE: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
  DOCUMENT: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  PDF: ['pdf'],
});

export const isValidFileSize = (fileSize: number, maxSize: number): boolean =>
  fileSize <= maxSize;

export const getMaxSizeByExtension = (fileExtension: string): number => {
  const extension = fileExtension.toLowerCase();

  if (FILE_EXTENSIONS.IMAGE.includes(extension)) {
    return FILE_SIZE.MAX_IMAGE_SIZE;
  }

  if (FILE_EXTENSIONS.PDF.includes(extension)) {
    return FILE_SIZE.MAX_PDF_SIZE;
  }

  if (FILE_EXTENSIONS.DOCUMENT.includes(extension)) {
    return FILE_SIZE.MAX_DOCUMENT_SIZE;
  }

  return FILE_SIZE.MAX_DOCUMENT_SIZE;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < FILE_SIZE.KB) return `${bytes} B`;
  if (bytes < FILE_SIZE.MB) return `${(bytes / FILE_SIZE.KB).toFixed(2)} KB`;
  if (bytes < FILE_SIZE.GB) return `${(bytes / FILE_SIZE.MB).toFixed(2)} MB`;
  return `${(bytes / FILE_SIZE.GB).toFixed(2)} GB`;
};
