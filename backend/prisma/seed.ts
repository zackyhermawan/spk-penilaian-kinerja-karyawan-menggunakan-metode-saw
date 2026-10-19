import { PrismaClient, CriteriaType } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Memulai proses seeding data...")

  // 1. Seed Owner User
  const password = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: {
      username: "adminberkahlogam",
    },
    update: {
      role: "OWNER",
    },
    create: {
      name: "Rahmani",
      username: "adminberkahlogam",
      password: password,
      role: "OWNER",
      workshop_name: "Berkah Logam",
      workshop_address: "Jl. Raya Industri No. 123, Jakarta",
    },
  })
  console.log("✅ User Owner berhasil dimasukkan.")

  // 2. Seed Master Position
  const positionsData = [
    { name: "Teknisi Las" },
    { name: "Teknisi Helper" }
  ]

  const positions = []
  for (const pos of positionsData) {
    const created = await prisma.position.create({
      data: pos,
    })
    positions.push(created)
  }
  console.log("✅ Master Position berhasil dimasukkan.")

  // 3. Seed Master Criteria (C1 - C6)
  const criteriasData = [
    { name: "Kehadiran", groupName: "Teknis", type: CriteriaType.BENEFIT },                  // C1
    { name: "Keterlambatan", groupName: "Teknis", type: CriteriaType.COST },                 // C2
    { name: "Sisa Potongan Besi Terbuang", groupName: "Sikap Kerja", type: CriteriaType.COST }, // C3
    { name: "Jam Kerja Lembur", groupName: "Sikap Kerja", type: CriteriaType.COST },            // C4
    { name: "Jumlah Pelanggaran K3", groupName: "Kualitas", type: CriteriaType.COST },        // C5
    { name: "Jumlah Pelanggaran R5", groupName: "Kualitas", type: CriteriaType.COST }         // C6
  ]

  const criterias = []
  for (const crit of criteriasData) {
    const created = await prisma.criteria.create({
      data: crit,
    })
    criterias.push(created)
  }
  console.log("✅ Master Criteria berhasil dimasukkan.")

  // 4. Seed Rating Scales per Criteria berdasarkan Gambar
  const c1 = criterias.find((c) => c.name === "Kehadiran")!
  const c2 = criterias.find((c) => c.name === "Keterlambatan")!
  const c3 = criterias.find((c) => c.name === "Sisa Potongan Besi Terbuang")!
  const c4 = criterias.find((c) => c.name === "Jam Kerja Lembur")!
  const c5 = criterias.find((c) => c.name === "Jumlah Pelanggaran K3")!
  const c6 = criterias.find((c) => c.name === "Jumlah Pelanggaran R5")!

  const ratingScalesData = [
    // C1: Kehadiran
    { criteriaId: c1.id, score: 5, minValue: 24, maxValue: 24 },
    { criteriaId: c1.id, score: 4, minValue: 22, maxValue: 23 },
    { criteriaId: c1.id, score: 3, minValue: 19, maxValue: 21 },
    { criteriaId: c1.id, score: 2, minValue: 16, maxValue: 18 },
    { criteriaId: c1.id, score: 1, minValue: 0, maxValue: 15 },

    // C2: Keterlambatan
    { criteriaId: c2.id, score: 5, minValue: 0, maxValue: 0 },
    { criteriaId: c2.id, score: 4, minValue: 1, maxValue: 2 },
    { criteriaId: c2.id, score: 3, minValue: 3, maxValue: 5 },
    { criteriaId: c2.id, score: 2, minValue: 6, maxValue: 8 },
    { criteriaId: c2.id, score: 1, minValue: 8, maxValue: 999 },

    // C3: Sisa Potongan Besi Terbuang
    { criteriaId: c3.id, score: 5, minValue: 0, maxValue: 2 },
    { criteriaId: c3.id, score: 4, minValue: 2.01, maxValue: 4 },
    { criteriaId: c3.id, score: 3, minValue: 4.01, maxValue: 6 },
    { criteriaId: c3.id, score: 2, minValue: 6.01, maxValue: 8 },
    { criteriaId: c3.id, score: 1, minValue: 8.01, maxValue: 999 },

    // C4: Jam Kerja Lembur
    { criteriaId: c4.id, score: 5, minValue: 0, maxValue: 1 },
    { criteriaId: c4.id, score: 4, minValue: 1.01, maxValue: 4 },
    { criteriaId: c4.id, score: 3, minValue: 4.01, maxValue: 8 },
    { criteriaId: c4.id, score: 2, minValue: 8.01, maxValue: 12 },
    { criteriaId: c4.id, score: 1, minValue: 12.01, maxValue: 999 },

    // C5: Jumlah Pelanggaran K3
    { criteriaId: c5.id, score: 5, minValue: 0, maxValue: 0 },
    { criteriaId: c5.id, score: 4, minValue: 1, maxValue: 2 },
    { criteriaId: c5.id, score: 3, minValue: 3, maxValue: 4 },
    { criteriaId: c5.id, score: 2, minValue: 5, maxValue: 6 },
    { criteriaId: c5.id, score: 1, minValue: 6, maxValue: 999 },

    // C6: Jumlah Pelanggaran R5
    { criteriaId: c6.id, score: 5, minValue: 0, maxValue: 0 },
    { criteriaId: c6.id, score: 4, minValue: 1, maxValue: 2 },
    { criteriaId: c6.id, score: 3, minValue: 3, maxValue: 4 },
    { criteriaId: c6.id, score: 2, minValue: 5, maxValue: 6 },
    { criteriaId: c6.id, score: 1, minValue: 6, maxValue: 999 },
  ]

  await prisma.ratingScale.createMany({
    data: ratingScalesData,
  })
  console.log("✅ Rating Scales berhasil dimasukkan.")

  // 5. Seed PositionCriteria (Pemetaan Bobot per Posisi)
  const welderPos = positions.find((p) => p.name === "Teknisi Las")!

  await prisma.positionCriteria.createMany({
    data: [
      { positionId: welderPos.id, criteriaId: c1.id, weight: 0.35 },
      { positionId: welderPos.id, criteriaId: c2.id, weight: 0.20 },
      { positionId: welderPos.id, criteriaId: c3.id, weight: 0.15 },
      { positionId: welderPos.id, criteriaId: c4.id, weight: 0.15 },
      { positionId: welderPos.id, criteriaId: c5.id, weight: 0.075 },
      { positionId: welderPos.id, criteriaId: c6.id, weight: 0.075 },
    ],
  })
  console.log("✅ Position Criteria berhasil dimasukkan.")

  // 6. Seed Employee Data
  const employeeNames = ["Caryono", "Rudin", "Angkat", "Sawali"]

  for (let i = 0; i < employeeNames.length; i++) {
    const name = employeeNames[i]
    const code = `EMP-${String(i + 1).padStart(3, "0")}` 

    await prisma.employee.create({
      data: {
        name: name,
        code: code,
        positionId: welderPos.id,
      },
    })
  }
  console.log("✅ Data Employee berhasil dimasukkan.")

  console.log("🚀 Seeding selesai dengan sukses!")
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })