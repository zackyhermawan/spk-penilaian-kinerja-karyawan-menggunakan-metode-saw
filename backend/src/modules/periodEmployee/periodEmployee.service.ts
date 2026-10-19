import { PeriodEmployeeRepository } from "./periodEmployee.repository.js";

export class PeriodEmployeeService {
    private periodEmployeeRepository = new PeriodEmployeeRepository()

    async findAll() {
        return this.periodEmployeeRepository.findAll()
    }
}