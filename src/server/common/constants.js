export const SUPPORTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/json',
  'image/svg+xml',
  'text/plain',
  'text/html',
  'text/javascript',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/x-sh',
];

export const EXTENSIONS = {
  EXCEL: '.xlsx',
  DOCX: '.docx',
  DOC: '.doc',
};

export const COLLECTION_NAMES = {
  SHARING_INFO: 'file_sharing_pdbignore',
};

export const DOMAINS = {
  ID: process.env.USER_MODULE_URL || 'localhost:8000',
  PROVENDOCS: process.env.DOCS_URL || 'localhost:8888',
  API: process.env.API_URL || 'localhost:8080',
  INTERNAL_API: process.env.INTERNAL_API_URL || 'localhost:8080', // TODO: this is just added for the local kubernetes deployment
  THUMBS_MODULE_URL: process.env.THUMBS_MODULE_URL || 'localhost:8889',
};

export const MIMETYPES = {
  EMAIL: 'email',
  PDF: 'application/pdf',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  SVG: 'image/svg+xml',
  OCTET_STREAM: 'application/octet-stream',
  JSON: 'application/json',
  TEXT: 'text/plain',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  HTML: 'text/html',
  JS: 'text/javascript',
  SHELL: 'text/x-sh',
};

export const LOG_LEVELS = {
  SILLY: 'silly',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

export const ENV_TYPES = {
  DEV: 'DEV',
  PROD: 'PROD',
  TEST: 'TEST',
};

export const STACKDRIVER_SEVERITY = {
  DEFAULT: 'DEFAULT',
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  NOTICE: 'NOTICE',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
  ALERT: 'ALERT',
  EMERGENCY: 'EMERGENCY',
};

export const ERROR_CODES = {
  FAILED_TO_SUBMIT_PROOF: 1001,
  FAILED_TO_READ_FILE: 1002,
  FAILED_TO_WRITE_FILE: 1003,
  MAMMOTH_DOCX_2_HTML_ERROR: 1004,
};
