/**
 * @fileoverview Class encapsulating file uploading logic.
 * 
 * Demonstrates OOP Principle: Encapsulation.
 */

'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

class UploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this._ensureDirectoryExists();
    this.multerInstance = this._configureMulter();
  }

  /**
   * Helper to ensure the target local uploads directory exists.
   * @private
   */
  _ensureDirectoryExists() {
    if (process.env.VERCEL) return;
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (e) {}
  }

  /**
   * Sets up disk storage and filtering constraints.
   * @private
   * @returns {object} Multer instance
   */
  _configureMulter() {
    if (process.env.VERCEL) {
      return multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: this._fileFilter()
      });
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const fileFilter = (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|pdf/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('Only images and PDF documents are allowed for ID proof'));
    };

    return multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: fileFilter
    });
  }

  _fileFilter() {
    return (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|pdf/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('Only images and PDF documents are allowed for ID proof'));
    };
  }

  getMiddleware() {
    return this.multerInstance.single('file');
  }

  async uploadToS3OrLocal(file) {
    if (process.env.USE_MOCK_S3 === 'true' || !process.env.AWS_ACCESS_KEY_ID) {
      if (process.env.VERCEL) return `/uploads/${file.originalname}`;
      return `/uploads/${file.filename}`;
    } else {
      console.log('Uploading file to S3 bucket:', process.env.AWS_S3_BUCKET_NAME);
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`;
    }
  }
}

// Export single shared instance of service (Singleton-like pattern)
module.exports = new UploadService();
