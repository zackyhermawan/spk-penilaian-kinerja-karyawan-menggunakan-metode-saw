import { AppError } from "../../errors/AppError.js";
import { PositionCriteriaQuery } from "../../interface/positionCriteriaQuery.js";
import { CriteriaRepository } from "../criteria/criteria.repository.js";
import { PositionRepository } from "../position/position.repository.js";
import { PositionCriteriaRepository } from "./positionCriteria.repository.js";

export class PositionCriteriaService {
    private positionCriteriaRepository = new PositionCriteriaRepository()
    private positionRepository = new PositionRepository()
    private criteriaRepository = new CriteriaRepository()
    
    async create(data: {
        weight: number
        positionId: number
        criteriaId: number
    }) {
        const position = await this.positionRepository.findById(data.positionId)
        if(!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        const criteria = await this.criteriaRepository.findById(data.criteriaId)
        if(!criteria) {
            throw new AppError("Kriteria tidak ditemukan", 404)
        }

        if(!criteria.isActive) {
            throw new AppError("Kriteria tidak aktif", 400)
        }

        const existing = await this.positionCriteriaRepository.findUnique(data.positionId, data.criteriaId)
        if(existing) {
            throw new AppError("Posisi kriteria sudah tersedia", 400)
        }

        await this.validateTotalWeight(data.positionId, data.weight)

        return this.positionCriteriaRepository.create(data)
    }

    async findAll(query: PositionCriteriaQuery) {
        return this.positionCriteriaRepository.findAll(query)
    }

    async getWeightSummary() {
        return this.positionCriteriaRepository.getWeightSummary()
    }

    async validateTotalWeight(positionId: number, newWeight: number, excludeId?: number) {
        const positionCriterias = await this.positionCriteriaRepository.findAll({
            positionId,
            page: 1,
            limit: 1000
        })

        const currentTotal = positionCriterias.data.filter((item) => item.id !== excludeId).reduce((total, item) => total + Number(item.weight), 0)

        const newTotal = Number((currentTotal + newWeight).toFixed(2))

        if (newTotal > 1) {
            throw new AppError(`Total bobot posisi melebihi 1.00. Sisa bobot yang tersedia: ${Math.max(0, 1 - currentTotal).toFixed(2)}`, 400)
        }
    }

    async update(id: number, data: {
        weight: number
        positionId: number
        criteriaId: number
    }) {
        const positionCriteria = await this.positionCriteriaRepository.findById(id)
        if(!positionCriteria) {
            throw new AppError("Posisi kriteria tidak ditemukan", 404)
        }

        const position = await this.positionRepository.findById(data.positionId)
        if(!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        const criteria = await this.criteriaRepository.findById(data.criteriaId)
        if(!criteria) {
            throw new AppError("Kriteria tidak ditemukan", 404)
        }

        const existing = await this.positionCriteriaRepository.findUnique(data.positionId, data.criteriaId)
        if(existing && existing.id !== id) {
            throw new AppError("Posisi kriteria sudah tersedia", 400)
        }

        await this.validateTotalWeight(data.positionId, data.weight, id)

        return this.positionCriteriaRepository.update(id, data)
    }

    async delete(id: number) {
        const positionCriteria = await this.positionCriteriaRepository.findById(id)
        if(!positionCriteria) {
            throw new AppError("Posisi kriteria tidak ditemukan", 404)
        }

        const usedInEvaluation = await this.positionCriteriaRepository.findInEvaluation(positionCriteria.positionId, positionCriteria.criteriaId)
        if(usedInEvaluation) {
            throw new AppError("Posisi kriteria tidak bisa dihapus, karena sudah digunakan dalam penilaian", 400)
        }

        return this.positionCriteriaRepository.delete(id)
    }
}