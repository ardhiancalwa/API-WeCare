const prisma = require("../config/database");
const Pagination = require("../utils/pagination");
const { AppError } = require("../utils/errorHandler");

class DiseaseService {
  static async getAllDiseases(query) {
    const { skip, take, page, limit } = Pagination.getPaginationParams(query);

    const [diseases, total] = await Promise.all([
      prisma.disease.findMany({
        skip,
        take,
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.disease.count(),
    ]);

    if (!total) {
      throw new AppError("Disease not found", 404);
    }

    return {
      data: diseases,
      total,
      page,
      limit,
    };
  }

  static async getDiseaseById(id) {
    const disease = await prisma.disease.findUnique({
      where: { id: parseInt(id) },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!disease) {
      throw new AppError("Disease not found", 404);
    }

    return disease;
  }

  static async createDisease(diseaseData) {
    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(diseaseData.hospitalId) },
    });

    if (!hospital) {
      throw new AppError("Hospital not found", 404);
    }

    const disease = await prisma.disease.create({
      data: {
        ...diseaseData,
        hospitalId: parseInt(diseaseData.hospitalId),
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return disease;
  }

  static async updateDisease(id, diseaseData) {
    const existingDisease = await prisma.disease.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDisease) {
      throw new AppError("Disease not found", 404);
    }

    if (diseaseData.hospitalId) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: parseInt(diseaseData.hospitalId) },
      });

      if (!hospital) {
        throw new AppError("Hospital not found", 404);
      }
    }

    const updatedDisease = await prisma.disease.update({
      where: { id: parseInt(id) },
      data: {
        ...diseaseData,
        hospitalId: diseaseData.hospitalId ? parseInt(diseaseData.hospitalId) : undefined,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return updatedDisease;
  }

  static async deleteDisease(id) {
    const existingDisease = await prisma.disease.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDisease) {
      throw new AppError("Disease not found", 404);
    }

    await prisma.disease.delete({
      where: { id: parseInt(id) },
    });

    return { message: "Disease deleted successfully" };
  }
}

module.exports = DiseaseService;