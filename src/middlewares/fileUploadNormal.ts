import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import createHttpError from "http-errors";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { max_file_size, UPLOAD_FOLDER } from "../config";

// Configurations
const MAX_FILE_SIZE = Number(max_file_size) || 5 * 1024 * 1024; // 5 MB max size
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];

// AWS S3 setup for AWS SDK v3
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be defined in environment variables.");
}

const s3 = new S3Client({
  region: AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Storage configuration for S3 using multer-s3
const storage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME || "car-rental-radwan",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const extName = path.extname(file.originalname);
    const fileName = `${Date.now()}-${file.originalname.replace(extName, "")}${extName}`;

    if (file.fieldname === "image") {
      req.body.image = fileName;
    } 

    cb(null, fileName);
  },
  contentType: function (req, file, cb) {
    const mimeTypes: { [key: string]: string } = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".pdf": "application/pdf",
    };
    const extName = path.extname(file.originalname).toLowerCase();
    const contentType = mimeTypes[extName] || "application/octet-stream";
    cb(null, contentType);
  },
});

// File filter to restrict file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  let extName = path.extname(file.originalname).toLowerCase();
  const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
  if (!isAllowedFileType) {
    return cb(createHttpError(400, "File type not allowed"));
  }
  cb(null, true);
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export default upload;

