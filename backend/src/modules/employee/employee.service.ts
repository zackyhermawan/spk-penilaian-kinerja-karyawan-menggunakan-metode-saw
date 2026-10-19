import { EmployeeStatus } from "@prisma/client";
import { EmployeeRepository } from "./employee.repository.js";
import { PositionRepository } from "../position/position.repository.js";
import { AppError } from "../../errors/AppError.js";
import dayjs from "dayjs";
import bcrypt from "bcrypt"
import { EmployeeQuery } from "../../interface/employeeQuery.js";

export class EmployeeService {
    private employeeRepository = new EmployeeRepository()
    private positionRepository = new PositionRepository()

    async create(data: {
        code: string
        name: string
        phone?: string
        birthDate: Date
        status: EmployeeStatus
        positionId: number
    }) {
        const position = await this.positionRepository.findById(data.positionId)
        if(!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        const existsCode = await this.employeeRepository.findByCode(data.code)
        if(existsCode) {
            throw new AppError("Code tersebut sudah digunakan", 400)
        }

        const rawPassword = dayjs(data.birthDate).format("DDMMYYYY")
        const passwordHash = await bcrypt.hash(rawPassword, 10)

        const result = await this.employeeRepository.create({
            ...data,
            passwordHash
        })

        return {
            employee: {
              ...result.employee,
              birthDate: result.employee.birthDate ? dayjs(result.employee.birthDate).format("YYYY-MM-DD") : null  
            },
            account: {
                username: result.user.username,
                password: rawPassword
            }
        }
    }

    async findAll(query: EmployeeQuery) {
        const result = await this.employeeRepository.findAll(query)

        return {
            ...result,
            data: result.data.map((emp) => ({
                ...emp,
                birthDate: emp.birthDate ? dayjs(emp.birthDate).format("YYYY-MM-DD") : null
            }))
        }
    }

    async findById(id: number) {
        return this.employeeRepository.findById(id)
    }

    async findOption() {
        return this.employeeRepository.findOption()
    }

    async updateStatus(id: number, status: EmployeeStatus) {
        const employee = await this.employeeRepository.findById(id)
        if(!employee) {
            throw new AppError("Karyawan tidak ditemukan", 404)
        }

        return this.employeeRepository.updateStatus(id, status)
    }

    async update(id: number, data: {
        code: string
        name: string
        phone?: string
        birthDate: Date
        status: EmployeeStatus
        positionId: number
    }) {
        const employee = await this.employeeRepository.findById(id)
        if(!employee) {
            throw new AppError("Karyawan tidak ditemukan", 404)
        }

        const position = await this.positionRepository.findById(data.positionId)
        if(!position) {
            throw new AppError("Posisi tidak ditemukan", 404)
        }

        const existsCode = await this.employeeRepository.findByCode(data.code)
        if(existsCode && existsCode.id !== id) {
            throw new AppError("Code tersebut sudah digunakan", 400)
        }

        const result = await this.employeeRepository.update(id, data)

        return {
            ...result,
            birthDate: result.birthDate ? dayjs(result.birthDate).format("YYYY-MM-DD") : null
        }
    }

    async delete(id: number) {
        const employee = await this.employeeRepository.findById(id)
        if(!employee) {
            throw new AppError("Karyawan tidak ditemukan", 404)
        }

        const usedInEvaluation = await this.employeeRepository.findInEvaluation(id)
        if(usedInEvaluation) {
            throw new AppError("Karyawan tidak bisa dihapus, karena karyawan tersebut sedang dinilai atau sudah memiliki riwayat penilaian", 400)
        }

        const usedInPeriodEmployee = await this.employeeRepository.findInPeriodEmployee(id)
        if(usedInPeriodEmployee) {
            throw new AppError("Karyawan tidak bisa dihapus, karena karyawan tersebut sedang dinilai atau sudah memiliki riwayat penilaian", 400)
        }

        return this.employeeRepository.delete(id)
    }
}