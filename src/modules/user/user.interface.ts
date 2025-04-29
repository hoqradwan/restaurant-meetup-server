import { Document } from "mongoose";

// Common base interface
export interface IBaseUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "user" | "restaurant";
  phone: string;
  address: string;
  location :{
    type : string;
    coordinates : [number,number];
  },
  idPhoto: {
    front: string; 
    back: string;  
  };

  isDeleted: boolean;
  isActive: boolean;
}

// Regular User interface
export interface IUser extends IBaseUser {
  role: "user";
  image :string;
  age: string;
  gender: string;
  about: string;
  bio: string;
  expiryDate: Date | null;
  activeDate: Date | null;
  isDeleted: boolean;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  educationalQualification: 'High School' | 'Bachelor' | 'Master' | 'PhD' | 'Other';
  profession: string;
  workExperience?: string; // Optional, can expand with more details as needed
  religion?: string;
  weight :  number;
  height : number;
  groupsAndAffiliation?: string;
  politicalViews?: 'right' | 'left' | 'others' | 'none';
  maritalStatus: 'single' | 'married';
  children?: 'yes' | 'no';
  languages: ('English' | 'Bangla' | 'Spanish' | 'French' | 'German' | 'Other')[];  
}

// Restaurant interface
export interface IRestaurant extends IBaseUser {
  role: "restaurant";
  establishmentName: string;
}

// Admin interface
export interface IAdmin extends IBaseUser {
  role: "admin";
}

// Pending User interface (unchanged)
export interface IPendingUser extends Document {
  email: string;
  firstName: string;
  lastName:  String;
  password: string;
  confirmPassword: string;
  establishmentName: string;
  role: "user" | "admin" | "restaurant";
}

// OTP interface (unchanged)
export interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}


// import { Document } from "mongoose";
// import { intersection } from "zod";

// export type IPendingUser = {
//   email: string;
//   name: string;
//   password: string;
//   confirmPassword: string;
//   role: "user" | "admin" | "mechanic";
// } & Document;

// export type IUser = {
//   name?: string;
//   email: string;
//   password?: string;
//   confirmPassword?: string;
//   phone?: string;
//   address?: string;
//   image?: {
//     publicFileURL: string;
//     path: string;
//   };
//   role: "admin" | "user" | "mechanic";
//   status: "active" | "blocked";
//   age: string;
//   gender: string;
//   about: string;
//   bio: string;
//   cuponCode: string;
//   location :{
    
//     type : string;
//     coordinates : [number,number];
//   },
//   isActive : boolean;
//   expiryDate: Date | null;
//   activeDate: Date | null;
//   isDeleted: boolean;
//   uniqueUserId: string;
//   linkedinUrl?: string;
//   facebookUrl?: string;
//   instagramUrl?: string;
//   idPhoto: {
//     front: string; // URL or path to photo
//     back: string;  // URL or path to photo
//   };
//   educationalQualification: 'High School' | 'Bachelor' | 'Master' | 'PhD' | 'Other';
//   profession: string;
//   workExperience?: string; // Optional, can expand with more details as needed
//   religion?: string;
//   groupsAndAffiliation?: string;
//   politicalViews?: 'right' | 'left' | 'others' | 'none';
//   maritalStatus: 'single' | 'married';
//   children?: 'yes' | 'no';
//   languages: ('English' | 'Bangla' | 'Spanish' | 'French' | 'German' | 'Other')[];
//   interests?: string[]; // Array of interests or hobbies
  
// } & Document;

// export type IOTP = {
//   email: string;
//   otp: string;
//   expiresAt: Date;
// } & Document;
