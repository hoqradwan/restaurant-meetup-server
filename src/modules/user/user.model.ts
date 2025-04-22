import mongoose, { Schema } from "mongoose";
import { IPendingUser, IUser, IOTP } from "./user.interface";

const PendingUserSchema = new Schema<IPendingUser>(
  {
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    confirmPassword: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "admin","resturant"],
    },
  },
  { timestamps: true },
);

export const PendingUserModel = mongoose.model<IPendingUser>(
  "PendingUser",
  PendingUserSchema,
);
// Enum for political views
const politicalViewsEnum = ['right', 'left', 'others', 'none'];

// Enum for marital status
const maritalStatusEnum = ['single', 'married'];

// Enum for children status
const childrenStatusEnum = ['yes', 'no'];

// Enum for educational qualification
const educationalQualificationEnum = ['High School', 'Bachelor', 'Master', 'PhD', 'Other'];

// Enum for language (you can add more languages if needed)
const languageEnum = ['English', 'Bangla', 'Spanish', 'French', 'German', 'Other'];
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, trim: true },
    confirmPassword: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },

    image: {
      type: {
        publicFileURL: { type: String, trim: true },
        path: { type: String, trim: true },
      },
      required: false,
      default: {
        publicFileURL: "/images/user.png",
        path: "public\\images\\user.png",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user", "resturant"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active", // Default value set to active
    },
    age: {
      type: String,
    },
    bio: {
      type: String,
    },
    about: {
      type: String,
    },
    gender: {
      type: String,
    },
    cuponCode: {
      type: String, // Store the name of the promo code
      default: "", // Default value will be an empty string
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    expiryDate: {
      type: Date, // Store the name of the promo code
      default: null, // Default value will be an empty string
    },
    activeDate: {
      type: Date, // Store the name of the promo code
      default: null, // Default value will be an empty string
    },
    linkedinUrl: {
      type: String,
    },
    facebookUrl: {
      type: String,
    },
    instagramUrl: {
      type: String,
    },
    idPhoto: {
      front: {
        type: String, // URL or path to photo
      },
      back: {
        type: String, // URL or path to photo
      },
    },
    educationalQualification: {
      type: String,
      enum: educationalQualificationEnum,
    },
    profession: {
      type: String,
    },
    workExperience: {
      type: String, // You can expand this with more fields as needed
    },
    religion: {
      type: String,
    },
    groupsAndAffiliation: {
      type: String,
    },
    politicalViews: {
      type: String,
      enum: politicalViewsEnum,
    },
    maritalStatus: {
      type: String,
      enum: maritalStatusEnum,
    },
    children: {
      type: String,
      enum: childrenStatusEnum,
    },
    languages: {
      type: [String],
      enum: languageEnum,
    },
    interests: {
      type: [String], // Array of strings for interests
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive : {
      type : Boolean,
      default : false
    },

  },
  { timestamps: true },
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

UserSchema.index({ location: "2dsphere" });

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, trim: true },
  otp: { type: String, required: true, trim: true },
  expiresAt: { type: Date, required: true },
});

export const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);
