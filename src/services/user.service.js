// src/services/user.service.js
const prisma = require('../config/database');
const Pagination = require('../utils/pagination');

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
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count()
    ]);

    return {
      data: users,
      total,
      page,
      limit
    };
  }
}

module.exports = UserService;