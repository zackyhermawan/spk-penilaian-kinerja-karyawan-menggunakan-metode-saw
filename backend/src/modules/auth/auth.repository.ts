import { prisma } from "../../lib/prisma.js";

export class AuthRepository {
    async findUserByUsername(username: string) {
        return prisma.user.findUnique({
            where: {
                username
            }
        })
    }

    async createUser(data: {
        name: string;
        username: string;
        password: string;
        role: string;
        workshop_name?: string;
        workshop_address?: string;
    }) {
        return prisma.user.create({
            data
        })
    }

    async findProfile(id: number) {
        return prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                workshop_address: true,
                workshop_name: true,
                employees: {
                    include: {
                        position: true
                    }
                }
            }
        })
    }
}