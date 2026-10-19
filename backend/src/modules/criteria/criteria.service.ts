import { CriteriaType } from "@prisma/client";
import { CriteriaRepository } from "./criteria.repository.js";
import { AppError } from "../../errors/AppError.js";
import { CriteriaQuery } from "../../interface/criteriaQuery.js";

export class CriteriaService {
    private criteriaRepository = new CriteriaRepository()

    async create(data: {
        name: string
        groupName?: string
        isActive?: boolean
        type: CriteriaType
    }) {
        const existsName = await this.criteriaRepository.findByName(data.name)
        if(existsName) {
            throw new AppError("Nama kriteria sudah digunakan", 400)
        }

        return this.criteriaRepository.create(data)
    }

    async findAll(query: CriteriaQuery) {
        return this.criteriaRepository.findAll(query)
    }
    
    async findOption() {
        return this.criteriaRepository.findOption()
    }

    async updateStatus(id: number, isActive: boolean) {
        const criteria = await this.criteriaRepository.findById(id)
        if(!criteria) {
            throw new AppError("Kriteria tidak ditemukan", 404)
        }

        return this.criteriaRepository.updateStatus(id, isActive)
    }

    async update(id: number, data: {
        name: string
        groupName?: string
        type: CriteriaType
    }) {
        const criteria = await this.criteriaRepository.findById(id)
        if(!criteria) {
            throw new AppError("Kriteria tidak ditemukan", 404)
        }

        const existsName = await this.criteriaRepository.findByName(data.name)
        if(existsName && existsName.id !== id) {
            throw new AppError("Nama kriteria sudah digunakan", 400)
        }

        return this.criteriaRepository.update(id, data)
    }

    async delete(id: number) {
        const criteria = await this.criteriaRepository.findById(id)
        if(!criteria) {
            throw new AppError("Kriteria tidak ditemukan", 404)
        }

        const usedInPositionCriteria = await this.criteriaRepository.findInPositionCriteria(id)
        if(usedInPositionCriteria) {
            throw new AppError("Kriteria tidak bisa dihapus, karena masih digunakan oleh posisi kriteria", 400)
        }

        const usedInEvaluation = await this.criteriaRepository.findInEvaluationDetail(id)
        if(usedInEvaluation) {
            throw new AppError("Kriteria tidak bisa dihapus, karena sudah memiliki riwayat penilaian", 400)
        }

        const usedInRatingScale = await this.criteriaRepository.findInRatingScale(id)
        if(usedInRatingScale) {
            throw new AppError("Kriteria tidak bisa dihapus, karena masih memiliki skala penilaian", 400)
        }

        return this.criteriaRepository.delete(id)
    }
}