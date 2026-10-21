import { Request } from "express";
import { returnFormatter, FormatterResult } from "../formatters/common.formatter.js";
import userModel from "../models/user.model.js";
import { verifyPassword } from "../utils/encrypt.js";
import { generateToken } from "../utils/jwt.js";
import { loginSuccessMessage } from "../constants/messageConstants.js";

export async function loginUser(req: Request): Promise<FormatterResult> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return returnFormatter(false, "Email and password are required");
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await userModel.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !user.password) {
      return returnFormatter(false, "Invalid email or password");
    }

    const isMatch = verifyPassword(String(password), user.password);
    if (!isMatch) {
      return returnFormatter(false, "Invalid email or password");
    }

    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    });

    const data = {
      token,
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return returnFormatter(true, loginSuccessMessage, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}
