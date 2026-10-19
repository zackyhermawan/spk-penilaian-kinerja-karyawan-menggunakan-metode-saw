import { AppError } from "../../errors/AppError.js";
import { PeriodQuery } from "../../interface/periodQuery.js";
import { PositionRepository } from "../position/position.repository.js";
import { PeriodRepository } from "./period.repository.js";

export class PeriodService {
    private periodRepository = new PeriodRepository()
    private positionRepository = new PositionRepository()

    async create(data: {
        month: number
        year: number
    }) {
        const existing = await this.periodRepository.findUnique(data.month, data.year)
        if(existing) {
            throw new AppError("Periode sudah ada", 400)
        }

        return this.periodRepository.create(data)
    }

    async findAll(query: PeriodQuery) {
        return this.periodRepository.findAll(query)
    }

    async findById(id: number) {
        return this.periodRepository.findById(id)
    }

    async findOption() {
        return this.periodRepository.findOption()
    }

    async findActive() {
        return this.periodRepository.findActive()
    }

    async findPositionsByPeriod(periodId: number) {
        const period = await this.periodRepository.findById(periodId)

        if (!period) {
            throw new Error("Period tidak ditemukan")
        }

        return this.periodRepository.findPositionsByPeriod(periodId)
    }

    async findEmployeesByPeriodAndPosition(periodId: number, positionId: number) {
        const period = await this.periodRepository.findById(periodId)

        if (!period) {
            throw new Error("Period tidak ditemukan")
        }

        const position = await this.positionRepository.findById(positionId)

        if (!position) {
            throw new Error("Position tidak ditemukan")
        }

        return this.periodRepository.findEmployeesByPeriodAndPosition(periodId, positionId)
    }

    async update(id: number, data: {
        month: number
        year: number
    }) {
        const period = await this.periodRepository.findById(id) 
        if(!period) {
            throw new AppError("Period tidak ditemukan", 404)
        }

        if(period.status === "CLOSED") {
            throw new AppError("Periode yang sudah ditutup tidak bisa diubah", 400)
        }

        const usedInEvaluation = await this.periodRepository.findInEvaluation(id)
        if(usedInEvaluation) {
            throw new AppError("Periode tidak bisa diubah karena sudah memiliki riwayat penilaian", 400)
        }

        return this.periodRepository.update(id, data)
    }

    async delete(id: number) {
        const period = await this.periodRepository.findById(id)
        if(!period) {
            throw new AppError("Periode tidak ditemukan", 404)
        }

        if(period.status === "CLOSED") {
            throw new AppError("Periode yang sudah ditutup tidak bisa dihapus", 400)
        }

        const usedInEvaluation = await this.periodRepository.findInEvaluation(id)
        if(usedInEvaluation) {
            throw new AppError("Periode tidak bisa dihapus karena sudah memiliki riwayat penilaian", 400)
        }

        return this.periodRepository.delete(id)
    }
}