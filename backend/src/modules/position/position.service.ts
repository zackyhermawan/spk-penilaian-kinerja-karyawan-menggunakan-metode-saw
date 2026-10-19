import { AppError } from "../../errors/AppError.js";
import { QueryParams } from "../../interface/query.js";
import { PositionRepository } from "./position.repository.js";

export class PositionService {
    private positionRepository = new PositionRepository()

    async create(data: {
        name: string;
        description?: string;
    }) {
        const position = await this.positionRepository.findByName(data.name)
        if(position) {
            throw new AppError("Posisi dengan nama tersebut sudah digunakan", 400)
        }

        return this.positionRepository.create(data)
    }

    async findAll(query: QueryParams) {
        return this.positionRepository.findAll(query)
    }

    async findOption() {
        return this.positionRepository.findOption()
    }

    async findCriteriaByPosition(positionId: number) {
        const position = await this.positionRepository.findById(positionId)
        if(!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        return this.positionRepository.findCriteriaByPosition(positionId)
    }

    async update(id: number, data: {
        name: string;
        description?: string;
    }) {
        const position = await this.positionRepository.findById(id)
        if(!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        const existsName = await this.positionRepository.findByName(data.name)
        if(existsName && existsName.id !== id) {
            throw new AppError("Posisi dengan nama tersebut sudah digunakan", 400)
        }

        return this.positionRepository.update(id, data)
    }

    async delete(id: number) {
        const position = await this.positionRepository.findById(id)
        if(!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        const countEmployees = await this.positionRepository.countEmployeesByPositionId(id)
        if(countEmployees > 0) {
            throw new AppError("Posisi tidak dapat dihapus karena masih digunakan oleh karyawan", 400)
        }

        return this.positionRepository.delete(id)
    }
}