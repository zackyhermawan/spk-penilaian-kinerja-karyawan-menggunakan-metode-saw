import { prisma } from "../../lib/prisma.js";

export class ProfileRepository {
    async findByUserId(userId: number) {
        return prisma.user.findUnique({
            where: {
              id: userId  
            },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                workshop_name: true,
                workshop_address: true,
                createdAt: true,
                employees: {
                    include: {
                        position: true
                    }
                }
            }
        })
    }

    async changePassword(userId: number, password: string) {
        return prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password
            }
        })
    }
}