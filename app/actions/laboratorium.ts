"use server";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function ajukanPinjaman(assetId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "Anda harus login terlebih dahulu untuk mengajukan pinjaman." };
    }

    const userId = session.user.id;

    try {
        const borrowing = await prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({
                where: { id: assetId },
            });

            if (!asset) {
                throw new Error("Alat tidak ditemukan.");
            }

            if (asset.stokTersedia <= 0) {
                throw new Error("Maaf, stok alat ini sedang tidak tersedia.");
            }

            await tx.asset.update({
                where: { id: assetId },
                data: { stokTersedia: { decrement: 1 } },
            });

            return tx.borrowing.create({
                data: {
                    userId,
                    assetId,
                    status: "PENDING",
                },
            });
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

        return { success: true, borrowingId: borrowing.id };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal mengajukan pinjaman." };
    }
}

export async function setujuiPinjaman(borrowingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses untuk menyetujui pinjaman." };
    }

    try {
        await prisma.borrowing.update({
            where: { id: borrowingId },
            data: { status: "DIPINJAM" },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menyetujui pinjaman." };
    }
}

export async function tolakPinjaman(borrowingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses untuk menolak pinjaman." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            const borrowing = await tx.borrowing.findUnique({
                where: { id: borrowingId },
            });

            if (!borrowing) {
                throw new Error("Data peminjaman tidak ditemukan.");
            }

            await tx.borrowing.update({
                where: { id: borrowingId },
                data: { status: "DITOLAK" },
            });

            await tx.asset.update({
                where: { id: borrowing.assetId },
                data: { stokTersedia: { increment: 1 } },
            });
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menolak pinjaman." };
    }
}
