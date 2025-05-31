// src/services/user.service.js
const prisma = require("../config/database");
const Pagination = require("../utils/pagination");
const { AppError } = require("../utils/errorHandler");

class UserService {
  static async getAllUsers(query) {
    const { skip, take, page, limit } = Pagination.getPaginationParams(query);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    if (total === 0) {
      throw new AppError("No users found", 404);
    }

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  static async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        provinsi: true,
        kota: true,
        kecamatan: true,
        kodepos: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  static async createUser(userData) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { phone: userData.phone }],
      },
    });

    if (existingUser) {
      throw new AppError("User with this email or phone already exists", 400);
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async updateUser(id, userData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // Check if email or phone is being changed and if it's already taken
    if (userData.email || userData.phone) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            {
              OR: [{ email: userData.email }, { phone: userData.phone }],
            },
          ],
        },
      });

      if (duplicateUser) {
        throw new AppError("Email or phone number already taken", 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: userData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  static async deleteUser(id) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return { message: "User deleted successfully" };
  }

  static async updateBpjsStatus(userId, bpjsData) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    let role = "NON_BPJS";

    // Logic untuk menentukan role berdasarkan BPJS
    if (bpjsData.bpjsNumber) {
      // Jika memiliki nomor BPJS
      if (bpjsData.lastPaymentDate) {
        const today = new Date();
        const lastPayment = new Date(bpjsData.lastPaymentDate);
        const monthsDifference =
          (today.getFullYear() - lastPayment.getFullYear()) * 12 +
          (today.getMonth() - lastPayment.getMonth());

        // Jika pembayaran terakhir > 1 bulan
        if (monthsDifference > 1) {
          role = "NON_ACTIVE_BPJS";
        } else {
          role = "BPJS";
        }
      } else {
        // Jika memiliki nomor BPJS tapi belum pernah bayar
        role = "NON_ACTIVE_BPJS";
      }
    } else {
      // Jika tidak memiliki nomor BPJS
      role = "NON_BPJS";
    }

    // Update user dengan role baru
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        bpjsNumber: bpjsData.bpjsNumber,
        lastPaymentDate: bpjsData.lastPaymentDate,
        role: role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        bpjsNumber: true,
        lastPaymentDate: true,
      },
    });

    return updatedUser;
  }

  static async checkBpjsStatus(userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    let status = {
      hasBpjs: false,
      isActive: false,
      role: user.role,
      lastPaymentDate: user.lastPaymentDate,
    };

    if (user.bpjsNumber) {
      status.hasBpjs = true;

      if (user.lastPaymentDate) {
        const today = new Date();
        const lastPayment = new Date(user.lastPaymentDate);
        const monthsDifference =
          (today.getFullYear() - lastPayment.getFullYear()) * 12 +
          (today.getMonth() - lastPayment.getMonth());

        status.isActive = monthsDifference <= 1;
      }
    }

    return status;
  }
}

module.exports = UserService;
