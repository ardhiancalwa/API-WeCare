// src/services/treatment.service.js
const prisma = require("../config/database");
const { AppError } = require("../utils/errorHandler");
const Pagination = require("../utils/pagination");

class TreatmentService {
  static async createTreatment(treatmentData) {
    // 1. Validasi user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(treatmentData.userId) },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // 2. Validasi disease
    const disease = await prisma.disease.findUnique({
      where: { id: parseInt(treatmentData.diseaseId) },
    });

    if (!disease) {
      throw new AppError("Disease not found", 404);
    }

    // 3. Validasi hospital
    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(treatmentData.hospitalId) },
    });

    if (!hospital) {
      throw new AppError("Hospital not found", 404);
    }

    // 4. Validasi paylater jika digunakan
    if (treatmentData.payLaterId) {
      const payLater = await prisma.payLater.findUnique({
        where: { id: parseInt(treatmentData.payLaterId) },
      });

      if (!payLater) {
        throw new AppError("PayLater not found", 404);
      }

      if (payLater.status !== "APPROVED") {
        throw new AppError("PayLater must be approved to use", 400);
      }

      if (payLater.userId !== parseInt(treatmentData.userId)) {
        throw new AppError("PayLater does not belong to this user", 400);
      }
    }

    // 5. Create treatment
    const treatment = await prisma.treatment.create({
      data: {
        appointmentDate: new Date(treatmentData.appointmentDate),
        userId: parseInt(treatmentData.userId),
        diseaseId: parseInt(treatmentData.diseaseId),
        hospitalId: parseInt(treatmentData.hospitalId),
        payLaterId: treatmentData.payLaterId
          ? parseInt(treatmentData.payLaterId)
          : null,
        notes: treatmentData.notes,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        disease: true,
        hospital: true,
        payLater: true,
      },
    });

    return treatment;
  }

  static async getAllTreatments(query) {
    const { skip, take, page, limit } = Pagination.getPaginationParams(query);

    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          disease: true,
          hospital: true,
          payLater: true,
        },
        orderBy: {
          appointmentDate: "desc",
        },
      }),
      prisma.treatment.count(),
    ]);

    if (!total) {
      throw new AppError("Treatment not found", 404);
    }

    return {
      data: treatments,
      total,
      page,
      limit,
    };
  }

  static async getTreatmentById(id) {
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        disease: true,
        hospital: true,
        payLater: true,
      },
    });

    if (!treatment) {
      throw new AppError("Treatment not found", 404);
    }

    return treatment;
  }

  static async updateTreatment(id, treatmentData) {
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!treatment) {
      throw new AppError("Treatment not found", 404);
    }

    // Validasi status update
    if (
      treatmentData.status &&
      !["PENDING", "ONGOING", "COMPLETED", "CANCELLED"].includes(
        treatmentData.status
      )
    ) {
      throw new AppError("Invalid status", 400);
    }

    const updatedTreatment = await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: {
        appointmentDate: treatmentData.appointmentDate
          ? new Date(treatmentData.appointmentDate)
          : undefined,
        status: treatmentData.status,
        notes: treatmentData.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        disease: true,
        hospital: true,
        payLater: true,
      },
    });

    return updatedTreatment;
  }

  static async approveTreatment(id) {
    // 1. Cek apakah treatment ada
    const treatment = await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        disease: true,
        hospital: true,
        payLater: true,
      },
    });

    if (!treatment) {
      throw new AppError("Treatment not found", 404);
    }

    // 2. Validasi status
    if (treatment.status !== "PENDING") {
      throw new AppError(
        `Cannot approve treatment with status ${treatment.status}`,
        400
      );
    }

    // 3. Update status treatment
    const updatedTreatment = await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: {
        status: "APPROVED",
        notes: treatment.notes
          ? `${treatment.notes}\nApproved at: ${new Date().toISOString()}`
          : `Approved at: ${new Date().toISOString()}`,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        disease: true,
        hospital: true,
        payLater: true,
      },
    });

    return updatedTreatment;
  }

  static async getCostEstimate(treatmentData) {
    // 1. Validasi disease
    const disease = await prisma.disease.findUnique({
      where: { id: parseInt(treatmentData.diseaseId) },
    });

    if (!disease) {
      throw new AppError("Disease not found", 404);
    }

    // 2. Validasi hospital
    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(treatmentData.hospitalId) },
    });

    if (!hospital) {
      throw new AppError("Hospital not found", 404);
    }

    // 3. Hitung estimasi biaya
    const baseCost = disease.cost;
    let totalCost = baseCost;

    // Tambahan biaya berdasarkan rumah sakit (jika ada)
    if (hospital.priceMultiplier) {
      totalCost *= hospital.priceMultiplier;
    }

    // 4. Cek apakah menggunakan paylater
    let payLaterInfo = null;
    if (treatmentData.payLaterId) {
      const payLater = await prisma.payLater.findUnique({
        where: { id: parseInt(treatmentData.payLaterId) },
      });

      if (!payLater) {
        throw new AppError("PayLater not found", 404);
      }

      if (payLater.status !== "APPROVED") {
        throw new AppError("PayLater must be approved to use", 400);
      }

      // Hitung cicilan jika menggunakan paylater
      const monthlyPayment =
        (totalCost + totalCost * payLater.interest) / payLater.tenor;

      payLaterInfo = {
        payLaterId: payLater.id,
        amount: payLater.amount,
        tenor: payLater.tenor,
        interest: payLater.interest,
        monthlyPayment: monthlyPayment,
        totalPayment: totalCost + totalCost * payLater.interest,
      };
    }

    return {
      disease: {
        id: disease.id,
        name: disease.name,
        type: disease.type,
        baseCost: disease.estimatedCost,
      },
      hospital: {
        id: hospital.id,
        name: hospital.name,
        priceMultiplier: hospital.priceMultiplier || 1,
      },
      costEstimate: {
        baseCost: baseCost,
        totalCost: totalCost,
        currency: "IDR",
      },
      payLater: payLaterInfo,
    };
  }
}

module.exports = TreatmentService;
