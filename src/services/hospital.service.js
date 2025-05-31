const prisma = require("../config/database");
const Pagination = require("../utils/pagination");
const { AppError } = require("../utils/errorHandler");

class HospitalService {
  static async getAllHospitals(query) {
    const { skip, take, page, limit } = Pagination.getPaginationParams(query);

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.hospital.count(),
    ]);

    if (!total) {
      throw new AppError("Hospital not found", 404);
    }

    return {
      data: hospitals,
      total,
      page,
      limit,
    };
  }

  static async getHospitalById(id) {
    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(id) },
    });

    if (!hospital) {
      throw new AppError("Hospital not found", 404);
    }

    return hospital;
  }

  static async createHospital(hospitalData) {
    const existingHospital = await prisma.hospital.findUnique({
      where: { phone: hospitalData.phone },
    });

    if (existingHospital) {
      throw new AppError("Hospital with this phone number already exists", 400);
    }

    const hospital = await prisma.hospital.create({
      data: hospitalData,
    });

    return hospital;
  }

  static async updateHospital(id, hospitalData) {
    const existingHospital = await prisma.hospital.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingHospital) {
      throw new AppError("Hospital not found", 404);
    }

    if (hospitalData.phone) {
      const duplicateHospital = await prisma.hospital.findFirst({
        where: {
          AND: [{ id: { not: parseInt(id) } }, { phone: hospitalData.phone }],
        },
      });

      if (duplicateHospital) {
        throw new AppError("Phone number already taken", 400);
      }
    }

    const updatedHospital = await prisma.hospital.update({
      where: { id: parseInt(id) },
      data: hospitalData,
    });

    return updatedHospital;
  }

  static async deleteHospital(id) {
    const existingHospital = await prisma.hospital.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingHospital) {
      throw new AppError("Hospital not found", 404);
    }

    await prisma.hospital.delete({
      where: { id: parseInt(id) },
    });

    return { message: "Hospital deleted successfully" };
  }

  static isValidTimeFormat(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}

module.exports = HospitalService;
