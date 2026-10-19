import { AppError } from "../../errors/AppError.js";
import { RatingScaleQuery } from "../../interface/ratingScaleQuery.js";
import { CriteriaRepository } from "../criteria/criteria.repository.js";
import { PeriodRepository } from "../period/period.repository.js";
import { RatingScaleRepository } from "./ratingScale.repository.js";

export class RatingScaleService {
    private ratingScaleRepository = new RatingScaleRepository()
    private criteriaRepository = new CriteriaRepository()
    private periodRepository = new PeriodRepository()

    async create(data: {
        minValue: number
        maxValue: number
        label?: string
        score: number
        criteriaId: number
    }) {
        const criteria = await this.criteriaRepository.findById(data.criteriaId)
        if(!criteria) {
            throw new AppError("Kriteria tidak ditemukan", 404)
        }

        if(criteria?.isActive === false) {
            throw new AppError("Kriteria yang tidak aktif tidak bisa diatur skala penilaiannya", 400)
        }

        if(data.score > 1 || data.score > 5) {
            throw new AppError("Skor harus bernilai antara 1 sampai 5", 400)
        }

        return this.ratingScaleRepository.create(data)
    }

    async findAll(query: RatingScaleQuery) {
        return this.ratingScaleRepository.findAll(query)
    }

    async update(id: number, data: {
        minValue: number
        maxValue: number
        label?: string
        score: number
        criteriaId: number
    }) {
        const criteria = await this.criteriaRepository.findById(data.criteriaId)
        if(!criteria) {
            throw new AppError("Kriteria tidak ditemukan", 404)
        }

        const activePeriod = await this.periodRepository.findActive()

        if(activePeriod) {
            throw new AppError("Tidak dapat mengubah karena ada periode penilaian yang masih aktif", 400)
        }

        if(data.score > 1 || data.score > 5) {
            throw new AppError("Skor harus bernilai antara 1 sampai 5", 400)
        }

        return this.ratingScaleRepository.update(id, data)
    }

    async delete(id: number) {
        const ratingScale = await this.ratingScaleRepository.findById(id)
        if(!ratingScale) {
            throw new AppError("Skala penilaian tidak ditemukan", 404)
        }

        const activePeriod = await this.periodRepository.findActive()

        if(activePeriod) {
            throw new AppError("Tidak dapat menghapus karena ada periode penilaian yang masih aktif", 400)
        }

        return this.ratingScaleRepository.delete(id)
    }
}