import mongoose, { model, Schema, SchemaOptions } from "mongoose";
import { IBaseUser, IUser, IRestaurant, IAdmin, IPendingUser, IOTP } from "./user.interface";

// Pending User Schema
interface IsUserRoleFunction {
  (): boolean;
}

const isUserRole: IsUserRoleFunction = function (this: { role: string }) { return this.role === "user"; };

const PendingUserSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  confirmPassword: { type: String, required: true, trim: true },
  establishmentName: {
    type: String,
    trim: true,
    required: function () {
      return this.role === "restaurant";
    }
  },
  role: { type: String, enum: ["user", "admin", "restaurant"], required: true },

  // User-specific fields (only allowed for role "user", not required)
  image: { type: String, default: "", },
  age: { type: String, default: "", },
  race: { type: String, default: "", },
  gender: { type: String, default: "", },
  bio: { type: String, default: "", },
  linkedinUrl: { type: String, default: "", },
  facebookUrl: { type: String, default: "", },
  instagramUrl: { type: String, default: "", },
  weight: { type: Number, default: 0, },
  height: { type: Number, default: 0, },
  educationalQualification: {
    type: String,
    enum: ["High School", "Bachelor", "Master", "PhD", "Other"],
    default: "High School",
  },
  profession: { type: String, default: "", },
  workExperience: { type: String, default: "", },
  religion: { type: String, default: "", },
  groupsAndAffiliation: { type: String, default: "", },
  politicalViews: {
    type: String,
    enum: ["right", "left", "others", "none"],
    default: "none",
  },
  maritalStatus: {
    type: String,
    enum: ["single", "married"],
    default: "single",
  },
  children: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  languages: {
    type: [String],
    enum: ["English", "Bangla", "Spanish", "French", "German", "Other"],
    default: ["English"],
  },
  interests: { type: [String], default: [], },

  // Common fields for both user and restaurant roles
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  idPhoto: {
    front: { type: String },
    back: { type: String },
  },
  isDeleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
}, { timestamps: true });

export const PendingUserModel = model<IPendingUser>("PendingUser", PendingUserSchema);

// Base User Schema
const BaseUserSchema = new Schema<IBaseUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    idPhoto: {
      front: { type: String },
      back: { type: String },
    },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
  },
  { discriminatorKey: "role", timestamps: true }
);

function extendSchema(baseSchema: Schema, extension: any, options?: SchemaOptions) {
  return new Schema({
    ...baseSchema.obj,
    ...extension
  }, (baseSchema as any).options);
}

// Regular User Schema
const UserSchema = extendSchema(BaseUserSchema, {
  image: { type: String, default: "" },
  age: { type: String, default: "" },
  race: { type: String, default: "" },
  gender: { type: String, default: "" },
  about: { type: String, default: "" },
  bio: { type: String, default: "" },
  linkedinUrl: { type: String, default: "" },
  facebookUrl: { type: String, default: "" },
  instagramUrl: { type: String, default: "" },
  weight: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  educationalQualification: {
    type: String,
    enum: ["High School", "Bachelor", "Master", "PhD", "Other"],
    default: "High School",
  },
  profession: { type: String, default: "" },
  workExperience: { type: String, default: "" },
  religion: { type: String, default: "" },
  groupsAndAffiliation: { type: String, default: "" },
  politicalViews: {
    type: String,
    enum: ["right", "left", "others", "none"],
    default: "none"
  },
  maritalStatus: {
    type: String,
    enum: ["single", "married","divorced","complicated"],
    default: "single"
  },
  children: {
    type: String,
    enum: ["yes", "no"],
    default: "no"
  },
  languages: {
    type: [String],
    enum: ["English", "Bangla", "Spanish", "French", "German", "Other"],
    default: ["English"],
  },
  interests: { type: [String], default: [] },
}, {
  timestamps: true
});

// Create the base model first
const BaseUserModel = model<IBaseUser>("User", BaseUserSchema);

// Restaurant Schema
const RestaurantSchema = extendSchema(BaseUserSchema, {
  establishmentName: { type: String, required: true, trim: true },

});

// Register discriminator
export const RestaurantModel = BaseUserModel.discriminator<IRestaurant>(
  "restaurant",
  RestaurantSchema
);
const AdminSchema = extendSchema(BaseUserSchema, {
  // ... admin-specific fields ...
});
export const AdminModel = BaseUserModel.discriminator<IAdmin>(
  "admin",  // This will set role="admin"
  AdminSchema
);
// OTP Schema
const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, trim: true },
  otp: { type: String, required: true, trim: true },
  expiresAt: { type: Date, required: true },
});

export const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);

// Index for geospatial queries
BaseUserSchema.index({ location: "2dsphere" });

// Export the base user model
export const UserModel = BaseUserModel.discriminator<IUser>(
  "user",
  UserSchema
);
