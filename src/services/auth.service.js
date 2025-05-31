// src/services/auth.service.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/database");
const { AppError } = require("../utils/errorHandler");

class AuthService {
  static async register(userData) {
    try {
      console.log("AuthService received data:", userData);

      if (!userData) {
        throw new AppError("User data is required", 400);
      }

      const normalizedData = {
        fullName: userData.fullname || userData.fullName,
        phone: userData.phone,
        email: userData.email,
        provinsi: userData.provinsi,
        kota: userData.kota,
        kecamatan: userData.kecamatan,
        kodepos: userData.kodepos,
        password: userData.password,
        nik: userData.nik || null,
        salary: userData.salary ? Number(userData.salary) : null,
        bpjsNumber: userData.bpjsNumber || null,
        paylaterStatus:
          userData.paylaterStatus === "true" ||
          userData.paylaterStatus === true,
        role: userData.role || "NON_BPJS",
      };

      console.log("Normalized data:", normalizedData);

      const requiredFields = [
        "fullName",
        "phone",
        "email",
        "provinsi",
        "kota",
        "kecamatan",
        "kodepos",
        "password",
      ];
      const missingFields = requiredFields.filter(
        (field) => !normalizedData[field]
      );

      if (missingFields.length > 0) {
        throw new AppError(
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: normalizedData.email },
            { phone: normalizedData.phone },
          ],
        },
      });

      if (existingUser) {
        throw new AppError("User already exists", 400);
      }

      const hashedPassword = await bcrypt.hash(normalizedData.password, 10);

      const user = await prisma.user.create({
        data: {
          ...normalizedData,
          password: hashedPassword,
        },
      });

      const tokens = this.generateTokens(user);

      return {
        user: this.excludePassword(user),
        ...tokens,
      };
    } catch (error) {
      console.error("AuthService error:", error);
      throw error;
    }
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  static async logout(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
  
      if (!user) {
        throw new AppError("User not found", 404);
      }
  
      return { message: "Logged out successfully" };
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  static async refreshToken(refreshToken) {
    try {
    
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return {
        accessToken,
      };
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  static generateTokens(user) {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  static excludePassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = AuthService;
