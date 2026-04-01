import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { hash } from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...\n");

    // Clean existing data
    await prisma.borrowing.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    const hashedPassword = await hash("password123", 10);

    const mahasiswa = await prisma.user.create({
        data: {
            nama: "Budi Santoso",
            email: "budi@mahasiswa.ac.id",
            password: hashedPassword,
            role: "MAHASISWA",
        },
    });

    const laboran = await prisma.user.create({
        data: {
            nama: "Siti Laboran",
            email: "siti@lab.ac.id",
            password: hashedPassword,
            role: "LABORAN",
        },
    });

    const kepalaLab = await prisma.user.create({
        data: {
            nama: "Dr. Ahmad Kepala",
            email: "ahmad@lab.ac.id",
            password: hashedPassword,
            role: "KEPALA_LAB",
        },
    });

    console.log("✅ Users created:");
    console.log(`   - ${mahasiswa.nama} (${mahasiswa.role})`);
    console.log(`   - ${laboran.nama} (${laboran.role})`);
    console.log(`   - ${kepalaLab.nama} (${kepalaLab.role})`);

    // Create computer lab assets
    const assets = await Promise.all([
        prisma.asset.create({
            data: {
                barcode: "LAB-PC-001",
                namaAlat: "PC Desktop All-in-One",
                stokTotal: 20,
                stokTersedia: 18,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-LPT-002",
                namaAlat: "Laptop ASUS VivoBook",
                stokTotal: 10,
                stokTersedia: 10,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-MON-003",
                namaAlat: "Monitor LED 24 inch",
                stokTotal: 20,
                stokTersedia: 20,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-KB-004",
                namaAlat: "Keyboard Mechanical",
                stokTotal: 25,
                stokTersedia: 25,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-MS-005",
                namaAlat: "Mouse Wireless Logitech",
                stokTotal: 25,
                stokTersedia: 25,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-PRJ-006",
                namaAlat: "Proyektor Epson",
                stokTotal: 3,
                stokTersedia: 2,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-PRN-007",
                namaAlat: "Printer LaserJet HP",
                stokTotal: 4,
                stokTersedia: 0,
                kondisi: "RUSAK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-HST-008",
                namaAlat: "Headset USB Logitech",
                stokTotal: 15,
                stokTersedia: 15,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-SWT-009",
                namaAlat: "Switch Managed 24-Port",
                stokTotal: 2,
                stokTersedia: 0,
                kondisi: "RUSAK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-RTR-010",
                namaAlat: "Router MikroTik",
                stokTotal: 5,
                stokTersedia: 4,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-UPS-011",
                namaAlat: "UPS APC 1200VA",
                stokTotal: 10,
                stokTersedia: 10,
                kondisi: "BAIK",
            },
        }),
        prisma.asset.create({
            data: {
                barcode: "LAB-HDD-012",
                namaAlat: "External HDD 1TB",
                stokTotal: 8,
                stokTersedia: 6,
                kondisi: "BAIK",
            },
        }),
    ]);

    console.log(`\n✅ ${assets.length} assets created (Lab Komputer)`);

    // Create sample borrowings
    await prisma.borrowing.create({
        data: {
            userId: mahasiswa.id,
            assetId: assets[1].id, // Laptop
            status: "PENDING",
        },
    });

    await prisma.borrowing.create({
        data: {
            userId: mahasiswa.id,
            assetId: assets[5].id, // Proyektor
            status: "DIPINJAM",
        },
    });

    await prisma.borrowing.create({
        data: {
            userId: mahasiswa.id,
            assetId: assets[11].id, // External HDD
            status: "SELESAI",
        },
    });

    console.log("✅ Sample borrowings created\n");
    console.log("🎉 Seed complete!\n");
    console.log("📋 Login credentials (all accounts use password: password123):");
    console.log("   Mahasiswa : budi@mahasiswa.ac.id");
    console.log("   Laboran   : siti@lab.ac.id");
    console.log("   Kepala Lab: ahmad@lab.ac.id");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
