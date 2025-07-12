import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import createHttpError from "http-errors";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { max_file_size, UPLOAD_FOLDER } from "../config";

// File type configurations
const FILE_CONFIGS = {
  image: {
    allowedTypes: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024, // 5MB for images
    mimeTypes: {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    }
  },
  video: {
    allowedTypes: [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"],
    maxSize: 100 * 1024 * 1024, // 100MB for videos
    mimeTypes: {
      ".mp4": "video/mp4",
      ".avi": "video/x-msvideo",
      ".mov": "video/quicktime",
      ".wmv": "video/x-ms-wmv",
      ".flv": "video/x-flv",
      ".webm": "video/webm",
    }
  },
  document: {
    allowedTypes: [".pdf", ".doc", ".docx"],
    maxSize: 10 * 1024 * 1024, // 10MB for documents
    mimeTypes: {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
  }
};

// Get all allowed file types
const getAllowedFileTypes = () => [
  ...FILE_CONFIGS.image.allowedTypes,
  ...FILE_CONFIGS.video.allowedTypes,
  ...FILE_CONFIGS.document.allowedTypes
];

// Get file type category
const getFileTypeCategory = (extension: string): keyof typeof FILE_CONFIGS | null => {
  for (const [category, config] of Object.entries(FILE_CONFIGS)) {
    if (config.allowedTypes.includes(extension)) {
      return category as keyof typeof FILE_CONFIGS;
    }
  }
  return null;
};

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
    const extName = path.extname(file.originalname).toLowerCase();
    const fileCategory = getFileTypeCategory(extName);
    
    cb(null, { 
      fieldName: file.fieldname,
      fileType: fileCategory || 'unknown',
      uploadedAt: new Date().toISOString()
    });
  },
  key: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const extName = path.extname(file.originalname).toLowerCase();
    const fileCategory = getFileTypeCategory(extName);
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(extName, "").replace(/[^a-zA-Z0-9-_]/g, "");
    
    // Create folder structure based on file type
    const folderPath = fileCategory ? `${fileCategory}s/` : "misc/";
    const fileName = `${folderPath}${timestamp}-${sanitizedOriginalName}${extName}`;

    // Store the file info in request body based on field name
    if (file.fieldname === "media") {
      if (!req.body.uploadedFiles) {
        req.body.uploadedFiles = {};
      }
      req.body.uploadedFiles[file.fieldname] = {
        fileName,
        fileType: fileCategory,
        originalName: file.originalname,
        size: file.size
      };
    }

    cb(null, fileName);
  },
  contentType: function (req, file, cb) {
    const extName = path.extname(file.originalname).toLowerCase();
    const fileCategory = getFileTypeCategory(extName);
    
    let contentType = "application/octet-stream";
    if (
      fileCategory &&
      (FILE_CONFIGS[fileCategory].mimeTypes as Record<string, string>)[extName]
    ) {
      contentType = (FILE_CONFIGS[fileCategory].mimeTypes as Record<string, string>)[extName];
    }
    
    cb(null, contentType);
  },
});

// Enhanced file filter with better validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const extName = path.extname(file.originalname).toLowerCase();
  const fileCategory = getFileTypeCategory(extName);
  
  if (!fileCategory) {
    return cb(createHttpError(400, `File type "${extName}" not allowed. Allowed types: ${getAllowedFileTypes().join(", ")}`));
  }
  
  // Additional validation based on field name
  if (file.fieldname === "media") {
    // For media field, allow both images and videos
    if (fileCategory !== "image" && fileCategory !== "video") {
      return cb(createHttpError(400, "Media field only accepts image or video files"));
    }
  }
  
  cb(null, true);
};

// Create different upload instances for different use cases
const createUploadInstance = (maxFileSize?: number) => {
  return multer({
    storage,
    fileFilter,
    limits: { 
      fileSize: maxFileSize || 100 * 1024 * 1024, // Default 100MB for videos
      files: 5 // Maximum 5 files
    },
  });
};

// Default upload instance
const upload = createUploadInstance();

// Specialized upload instances
const uploadImage = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const extName = path.extname(file.originalname).toLowerCase();
    const fileCategory = getFileTypeCategory(extName);
    
    if (fileCategory !== "image") {
      return cb(createHttpError(400, "Only image files are allowed"));
    }
    
    cb(null, true);
  },
  limits: { fileSize: FILE_CONFIGS.image.maxSize },
});

const uploadVideo = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const extName = path.extname(file.originalname).toLowerCase();
    const fileCategory = getFileTypeCategory(extName);
    
    if (fileCategory !== "video") {
      return cb(createHttpError(400, "Only video files are allowed"));
    }
    
    cb(null, true);
  },
  limits: { fileSize: FILE_CONFIGS.video.maxSize },
});

// Helper function to validate file size based on type
const validateFileSize = (file: Express.Multer.File): boolean => {
  const extName = path.extname(file.originalname).toLowerCase();
  const fileCategory = getFileTypeCategory(extName);
  
  if (!fileCategory) return false;
  
  return file.size <= FILE_CONFIGS[fileCategory].maxSize;
};

export { 
  upload, 
  uploadImage, 
  uploadVideo, 
  FILE_CONFIGS, 
  getFileTypeCategory, 
  validateFileSize 
};
export default upload;

// import multer, { FileFilterCallback } from "multer";
// import path from "path";
// import { Request } from "express";
// import createHttpError from "http-errors";
// import { S3Client } from "@aws-sdk/client-s3";
// import multerS3 from "multer-s3";
// import { max_file_size, UPLOAD_FOLDER } from "../config";

// // Configurations
// const MAX_FILE_SIZE = Number(max_file_size) || 5 * 1024 * 1024; // 5 MB max size
// const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];

// // AWS S3 setup for AWS SDK v3
// const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

// if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
//   throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be defined in environment variables.");
// }

// const s3 = new S3Client({
//   region: AWS_REGION || "us-west-2",
//   credentials: {
//     accessKeyId: AWS_ACCESS_KEY_ID,
//     secretAccessKey: AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Storage configuration for S3 using multer-s3
// const storage = multerS3({
//   s3,
//   bucket: process.env.AWS_BUCKET_NAME || "car-rental-radwan",
//   metadata: function (req, file, cb) {
//     cb(null, { fieldName: file.fieldname });
//   },
//   key: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
//     const extName = path.extname(file.originalname);
//     const fileName = `${Date.now()}-${file.originalname.replace(extName, "")}${extName}`;

//     if (file.fieldname === "image") {
//       req.body.image = fileName;
//     } 

//     cb(null, fileName);
//   },
//   contentType: function (req, file, cb) {
//     const mimeTypes: { [key: string]: string } = {
//       ".jpg": "image/jpeg",
//       ".jpeg": "image/jpeg",
//       ".png": "image/png",
//       ".pdf": "application/pdf",
//     };
//     const extName = path.extname(file.originalname).toLowerCase();
//     const contentType = mimeTypes[extName] || "application/octet-stream";
//     cb(null, contentType);
//   },
// });

// // File filter to restrict file types
// const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//   let extName = path.extname(file.originalname).toLowerCase();
//   const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
//   if (!isAllowedFileType) {
//     return cb(createHttpError(400, "File type not allowed"));
//   }
//   cb(null, true);
// };

// // Multer upload instance
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: MAX_FILE_SIZE },
// });

// export default upload;

