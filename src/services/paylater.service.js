const prisma = require("../config/database");
const Pagination = require("../utils/pagination");
const { AppError } = require("../utils/errorHandler");

class PayLaterService {
  static async getAllPayLaters(query) {
    const { skip, take, page, limit } = Pagination.getPaginationParams(query);

    const [paylaters, total] = await Promise.all([
      prisma.payLater.findMany({
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.payLater.count(),
    ]);

    if (!total) {
      throw new AppError("PayLater not found", 404);
    }

    return {
      data: paylaters,
      total,
      page,
      limit,
    };
  }

  static async getPayLaterById(id) {
    const paylater = await prisma.payLater.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!paylater) {
      throw new AppError("PayLater not found", 404);
    }

    return paylater;
  }

  static async createPayLater(payLaterData) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(payLaterData.userId) },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role === "NON_BPJS") {
      throw new AppError("User must have BPJS number to create paylater", 400);
    }

    if (user.role === "BPJS") {
      throw new AppError("Cannot create paylater while BPJS is active", 400);
    }

    if (!user.salary || user.salary <= 0) {
      throw new AppError("User must have valid salary to create paylater", 400);
    }

    const maxAmount = user.salary * 3; // Maximum 3x salary
    if (payLaterData.amount > maxAmount) {
      throw new AppError(`Maximum paylater amount is ${maxAmount}`, 400);
    }

    const interest = this.calculateInterest(
      payLaterData.amount,
      payLaterData.tenor
    );

    // Check if user already has active paylater
    const existingPayLater = await prisma.payLater.findFirst({
      where: {
        userId: parseInt(payLaterData.userId),
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
    });

    if (existingPayLater) {
      throw new AppError("User already has an active paylater", 400);
    }

    const paylater = await prisma.payLater.create({
      data: {
        amount: payLaterData.amount,
        tenor: payLaterData.tenor,
        interest: interest,
        userId: parseInt(payLaterData.userId),
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            salary: true,
            salary: true,
            bpjsNumber: true,
            lastPaymentDate: true,
          },
        },
      },
    });

    return paylater;
  }

  static calculateInterest(amount, tenor) {
    // Base interest rate
    let baseRate = 0.05; // 5%

    // Adjust rate based on amount
    if (amount > 10000000) {
      // > 10 juta
      baseRate += 0.02; // +2%
    } else if (amount > 5000000) {
      // > 5 juta
      baseRate += 0.01; // +1%
    }

    // Adjust rate based on tenor
    if (tenor > 24) {
      // > 24 bulan
      baseRate += 0.03; // +3%
    } else if (tenor > 12) {
      // > 12 bulan
      baseRate += 0.02; // +2%
    }

    return baseRate;
  }

  static async updatePayLater(id, payLaterData) {
    const existingPayLater = await prisma.payLater.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPayLater) {
      throw new AppError("PayLater not found", 404);
    }

    if (payLaterData.userId) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(payLaterData.userId) },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }
    }

    const updatedPayLater = await prisma.payLater.update({
      where: { id: parseInt(id) },
      data: {
        ...payLaterData,
        userId: payLaterData.userId ? parseInt(payLaterData.userId) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return updatedPayLater;
  }

  static async deletePayLater(id) {
    const existingPayLater = await prisma.payLater.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPayLater) {
      throw new AppError("PayLater not found", 404);
    }

    // Check if paylater is already approved or paid
    if (
      existingPayLater.status === "APPROVED" ||
      existingPayLater.status === "PAID"
    ) {
      throw new AppError("Cannot delete approved or paid paylater", 400);
    }

    await prisma.payLater.delete({
      where: { id: parseInt(id) },
    });

    return { message: "PayLater deleted successfully" };
  }

  static async approvePayLater(id) {
    // 1. Cek apakah paylater ada
    const paylater = await prisma.payLater.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            bpjsNumber: true,
            lastPaymentDate: true,
          },
        },
      },
    });

    if (!paylater) {
      throw new AppError("PayLater not found", 404);
    }

    // 2. Validasi status
    if (paylater.status !== "PENDING") {
      throw new AppError(
        `Cannot approve PayLater with status ${paylater.status}`,
        400
      );
    }

    // 3. Validasi user BPJS status
    if (paylater.user.role !== "NON_ACTIVE_BPJS") {
      throw new AppError(
        "User must have BPJS_NNON_ACTIVE_BPJSON_ACTIVE status to approve PayLater",
        400
      );
    }

    // 4. Update status paylater
    const updatedPayLater = await prisma.payLater.update({
      where: { id: parseInt(id) },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            bpjsNumber: true,
            lastPaymentDate: true,
          },
        },
      },
    });

    return updatedPayLater;
  }
}

module.exports = PayLaterService;
