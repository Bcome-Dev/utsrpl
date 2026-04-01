import { prisma } from "@/app/lib/prisma";
import BorrowButton from "@/app/components/BorrowButton";
import SearchBar from "@/app/components/SearchBar";
import {
  FlaskConical,
  Barcode,
  Package,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { q } = await searchParams;

  const assets = await prisma.asset.findMany({
    where: q
      ? {
        OR: [
          { namaAlat: { contains: q, mode: "insensitive" } },
          { barcode: { contains: q, mode: "insensitive" } },
        ],
      }
      : undefined,
    orderBy: { namaAlat: "asc" },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background pb-16 pt-12">
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Sistem Manajemen Laboratorium Terpadu
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Selamat Datang di{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LabsInc
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">
              Platform terpadu untuk pengelolaan aset laboratorium, peminjaman
              alat, dan monitoring ketersediaan stok secara real-time.
            </p>

            {/* Search Bar */}
            <div className="mt-8 w-full max-w-xl">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Katalog Aset
            </h2>
            <p className="mt-1 text-sm text-muted">
              {assets.length} alat tersedia di laboratorium
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-lg bg-surface-hover px-3 py-1.5 text-sm text-muted sm:flex">
            <Package className="h-4 w-4" />
            Total: {assets.length} item
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24">
            <FlaskConical className="mb-4 h-12 w-12 text-muted/40" />
            <h3 className="text-lg font-semibold text-foreground">
              Belum Ada Aset
            </h3>
            <p className="mt-1 text-sm text-muted">
              Data aset laboratorium belum tersedia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group relative flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${asset.kondisi === "BAIK"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                  >
                    {asset.kondisi === "BAIK" ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <ShieldAlert className="h-3 w-3" />
                    )}
                    {asset.kondisi}
                  </span>
                </div>

                {/* Info */}
                <h3 className="mb-1 text-lg font-bold text-foreground">
                  {asset.namaAlat}
                </h3>

                <div className="mb-4 flex items-center gap-1.5 text-sm text-muted">
                  <Barcode className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{asset.barcode}</span>
                </div>

                {/* Stock */}
                <div className="mb-4 flex items-center justify-between rounded-xl bg-surface-hover p-3">
                  <span className="text-sm text-muted">Stok Tersedia</span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-xl font-bold ${asset.stokTersedia > 0
                        ? "text-primary"
                        : "text-red-500"
                        }`}
                    >
                      {asset.stokTersedia}
                    </span>
                    <span className="text-xs text-muted">
                      / {asset.stokTotal}
                    </span>
                  </div>
                </div>

                {/* Borrow Button */}
                <div className="mt-auto">
                  <BorrowButton
                    assetId={asset.id}
                    disabled={asset.stokTersedia <= 0}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
