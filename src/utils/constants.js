export const PAGE_SIZE = 10;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOTFOUND: 404,
  INVALID_INPUT: 422,
  INTERNAL_SERVER_ERROR: 500,
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_KEY_VIOLATION: '23505',
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  PATIENT: 'patient',
};

export const UPLOAD_PATH = '../public/uploads/';

export const MAX_MULTER_FILE_SIZE = process.env.MULTER_FILE_SIZE_LIMIT || 10485760;
export const MAX_MULTER_FIELD_SIZE = process.env.MULTER_FIELD_SIZE_LIMIT || 10485760;
export const MAX_BODY_SIZE = process.env.BODY_SIZE_LIMIT || 52428800;

export const AWS_CONFIG = {
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  BUCKET: `mira-upload-storage-${process.env.NODE_ENV}`,
  PROFILE_PICTURE: [process.env.FOLDER_ALIAS, 'profile-picture'].join('-'),
  DOCUMENT_FILE: [process.env.FOLDER_ALIAS, 'document-file'].join('-'),
};

export const QUEUE_NAMES = {
  DEFAULT_QUEUE: 'DEFAULT_QUEUE',
  NOTIFICATION_QUEUE: 'NOTIFICATION_QUEUE',
  CLEANUP_QUEUE: 'CLEANUP_QUEUE',
};

export const DEFAULT_QUEUE_JOB_NAMES = {
  REMOVE_TMP_ASSET: 'REMOVE_TMP_ASSET',
};

export const CLEANUP_QUEUE_JOB_NAMES = {
  DELETE_S3_FILES: 'DELETE_S3_FILES',
};

export const WS_MESSAGES = {
  USER_UPDATED: 'USER_UPDATED',
  LOGOUT: 'LOGOUT_USER',
};

export const PUBLIC_ROUTES = [
  '/auth/signup',
  '/auth/signin',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export const NOTIFICATION_TYPES = {
  USER: 'user',
  SYSTEM: 'system',
};
