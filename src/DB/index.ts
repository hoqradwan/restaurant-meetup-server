import { AdminModel, UserModel } from "../modules/user/user.model";
import { hashPassword } from "../modules/user/user.service";

const admin = {
  firstName: "Admin",
  lastName: "baba",
  email: "admin@gmail.com",
  password: "1qazxsw2",
  isDeleted: false,
};

export const seedSuperAdmin = async () => {
  const isSuperAdminExists = await AdminModel.findOne({ email: admin.email });

  if (!isSuperAdminExists) {
    const hashedPassword = await hashPassword(admin.password);
    const adminWithHashedPassword = { ...admin, password: hashedPassword };

    // console.log("Super Admin created");
    await AdminModel.create(adminWithHashedPassword);
  }
};

export default seedSuperAdmin;
