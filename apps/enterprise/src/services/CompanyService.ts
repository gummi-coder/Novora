import { QueryOptimizer } from '@/utils/queryOptimizer';
import prisma from '@/lib/prisma';

export class CompanyService {
  private static readonly CACHE_TTL = {
    LIST: 5 * 60 * 1000, // 5 minutes
    DETAIL: 5 * 60 * 1000, // 5 minutes
    STATS: 15 * 60 * 1000, // 15 minutes
    SEARCH: 5 * 60 * 1000 // 5 minutes
  };

  static async getCompanies(page: number = 1, limit: number = 10) {
    return QueryOptimizer.findMany('company', {
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        industry: true,
        companySize: true,
        totalEmployees: true,
        eNPS: true
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      },
      cache: true,
      cacheTTL: this.CACHE_TTL.LIST,
      cacheTags: ['companies:list']
    });
  }

  static async getCompanyById(id: string) {
    return QueryOptimizer.findUnique('company', 
      { id },
      {
        select: {
          id: true,
          name: true,
          plan: true,
          status: true,
          industry: true,
          companySize: true,
          totalEmployees: true,
          eNPS: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        cache: true,
        cacheTTL: this.CACHE_TTL.DETAIL,
        cacheTags: [`company:${id}`, 'companies:detail']
      }
    );
  }

  static async getCompanyStats() {
    return QueryOptimizer.executeQuery(async () => {
      const [
        totalCompanies,
        activeCompanies,
        totalEmployees,
        averageENPS
      ] = await Promise.all([
        prisma.company.count(),
        prisma.company.count({ where: { status: 'ACTIVE' } }),
        prisma.company.aggregate({
          _sum: { totalEmployees: true }
        }),
        prisma.company.aggregate({
          _avg: { eNPS: true }
        })
      ]);

      return {
        totalCompanies,
        activeCompanies,
        totalEmployees: totalEmployees._sum.totalEmployees || 0,
        averageENPS: averageENPS._avg.eNPS || 0
      };
    }, {
      cache: true,
      cacheTTL: this.CACHE_TTL.STATS,
      cacheTags: ['companies:stats']
    });
  }

  static async searchCompanies(query: string) {
    return QueryOptimizer.findMany('company', {
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        industry: true,
        companySize: true
      },
      take: 10,
      cache: true,
      cacheTTL: this.CACHE_TTL.SEARCH,
      cacheTags: ['companies:search']
    });
  }

  static async updateCompany(id: string, data: any) {
    const result = await prisma.company.update({
      where: { id },
      data
    });

    // Invalidate relevant caches
    await Promise.all([
      QueryOptimizer.invalidateCache('company', 'list'),
      QueryOptimizer.invalidateCache('company', 'detail')
    ]);

    return result;
  }

  static async deleteCompany(id: string) {
    const result = await prisma.company.delete({
      where: { id }
    });

    // Invalidate all company-related caches
    await Promise.all([
      QueryOptimizer.invalidateCache('company', 'list'),
      QueryOptimizer.invalidateCache('company', 'detail')
    ]);

    return result;
  }
} 