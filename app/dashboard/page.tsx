import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import AdminActions from "@/app/components/AdminActions";
import {
    LayoutDashboard,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRightLeft,
    AlertCircle,
    ShieldCheck,
    Users,
    Inbox,
} from "lucide-react";

const statusConfig = {
    PENDING: {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: Clock,
    },
    DIPINJAM: {
        label: "Dipinjam",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        icon: ArrowRightLeft,
    },
    SELESAI: {
        label: "Selesai",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
    },
    DITOLAK: {
        label: "Ditolak",
        color: "bg-red-500/10 text-red-600 dark:text-red-400",
        icon: XCircle,
    },
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const isAdmin =
        session.user.role === "LABORAN" || session.user.role === "KEPALA_LAB";

    if (isAdmin) {
        const pendingBorrowings = await prisma.borrowing.findMany({
            where: { status: "PENDING" },
            include: {
                user: { select: { nama: true, email: true } },
                asset: { select: { namaAlat: true, barcode: true } },
            },
            orderBy: { tglPinjam: "desc" },
        });

        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Admin Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                                Dashboard Admin
                            </h1>
                            <p className="text-sm text-muted">
                                Kelola peminjaman alat laboratorium
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                                <Inbox className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {pendingBorrowings.length}
                                </p>
                                <p className="text-xs text-muted">Antrean Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {new Set(pendingBorrowings.map((b) => b.userId)).size}
                                </p>
                                <p className="text-xs text-muted">Pemohon Unik</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                <LayoutDashboard className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground capitalize">
                                    {session.user.role.toLowerCase().replace("_", " ")}
                                </p>
                                <p className="text-xs text-muted">Role Anda</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Table */}
                <div className="rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Antrean Peminjaman
                        </h2>
                        <p className="text-sm text-muted">
                            Daftar permintaan peminjaman yang menunggu persetujuan
                        </p>
                    </div>

                    {pendingBorrowings.length === 0 ? (
                        <div className="flex flex-col items-center py-16">
                            <Inbox className="mb-3 h-10 w-10 text-muted/40" />
                            <p className="font-medium text-foreground">
                                Tidak Ada Antrean
                            </p>
                            <p className="text-sm text-muted">
                                Semua permintaan telah diproses.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                        <th className="px-6 py-3">Pemohon</th>
                                        <th className="px-6 py-3">Alat</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pendingBorrowings.map((b) => (
                                        <tr
                                            key={b.id}
                                            className="transition-colors hover:bg-surface-hover/30"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {b.user.nama}
                                                    </p>
                                                    <p className="text-xs text-muted">{b.user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {b.asset.namaAlat}
                                                    </p>
                                                    <p className="font-mono text-xs text-muted">
                                                        {b.asset.barcode}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.tglPinjam).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <AdminActions borrowingId={b.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // MAHASISWA VIEW
    const borrowings = await prisma.borrowing.findMany({
        where: { userId: session.user.id },
        include: {
            asset: { select: { namaAlat: true, barcode: true } },
        },
        orderBy: { tglPinjam: "desc" },
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Student Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                        <LayoutDashboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                            Dashboard Saya
                        </h1>
                        <p className="text-sm text-muted">
                            Halo, {session.user.nama} — Berikut riwayat peminjaman Anda.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(["PENDING", "DIPINJAM", "SELESAI", "DITOLAK"] as const).map(
                    (status) => {
                        const cfg = statusConfig[status];
                        const Icon = cfg.icon;
                        const count = borrowings.filter((b) => b.status === status).length;
                        return (
                            <div
                                key={status}
                                className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.color}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-foreground">{count}</p>
                                        <p className="text-xs text-muted">{cfg.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>

            {/* Borrowing History Table */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <Clock className="h-5 w-5 text-primary" />
                        Riwayat Peminjaman
                    </h2>
                    <p className="text-sm text-muted">
                        Semua catatan peminjaman alat laboratorium Anda
                    </p>
                </div>

                {borrowings.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <Inbox className="mb-3 h-10 w-10 text-muted/40" />
                        <p className="font-medium text-foreground">Belum Ada Riwayat</p>
                        <p className="text-sm text-muted">
                            Anda belum pernah mengajukan peminjaman.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Nama Alat</th>
                                    <th className="px-6 py-3">Barcode</th>
                                    <th className="px-6 py-3">Tanggal Pinjam</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {borrowings.map((b, idx) => {
                                    const cfg = statusConfig[b.status];
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <tr
                                            key={b.id}
                                            className="transition-colors hover:bg-surface-hover/30"
                                        >
                                            <td className="px-6 py-4 text-sm text-muted">
                                                {idx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                {b.asset.namaAlat}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-muted">
                                                {b.asset.barcode}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.tglPinjam).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
