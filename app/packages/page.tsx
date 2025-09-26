"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconEdit, IconTrash, IconPackage, IconCurrencyDollar } from "@tabler/icons-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

interface Package {
  id: number;
  nama_paket: string;
  jenis: 'kiloan' | 'selimut' | 'bed_cover' | 'kaos' | 'lain';
  harga: number;
  id_outlet: number;
  tb_outlet: {
    nama: string;
  };
  created_at: string;
}

interface Outlet {
  id: number;
  nama: string;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    nama_paket: "",
    jenis: "",
    harga: "",
    id_outlet: "",
  });

  useEffect(() => {
    fetchPackages();
    fetchOutlets();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages');
      const result = await response.json();
      if (result.success) {
        setPackages(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data paket");
    } finally {
      setLoading(false);
    }
  };

  const fetchOutlets = async () => {
    try {
      const response = await fetch('/api/outlets');
      const result = await response.json();
      if (result.success) {
        setOutlets(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data outlet");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPackage ? `/api/packages/${editingPackage.id}` : '/api/packages';
      const method = editingPackage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          harga: parseInt(formData.harga),
          id_outlet: parseInt(formData.id_outlet),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingPackage ? "Paket berhasil diupdate" : "Paket berhasil ditambahkan");
        setDialogOpen(false);
        resetForm();
        fetchPackages();
      } else {
        toast.error(result.error || "Gagal menyimpan paket");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      nama_paket: pkg.nama_paket,
      jenis: pkg.jenis,
      harga: pkg.harga.toString(),
      id_outlet: pkg.id_outlet.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus paket ini?")) return;

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Paket berhasil dihapus");
        fetchPackages();
      } else {
        toast.error(result.error || "Gagal menghapus paket");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  const resetForm = () => {
    setFormData({
      nama_paket: "",
      jenis: "",
      harga: "",
      id_outlet: "",
    });
    setEditingPackage(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  const getJenisLabel = (jenis: string) => {
    const labels = {
      kiloan: 'Kiloan',
      selimut: 'Selimut',
      bed_cover: 'Bed Cover',
      kaos: 'Kaos',
      lain: 'Lainnya'
    };
    return labels[jenis as keyof typeof labels] || jenis;
  };

  const getJenisVariant = (jenis: string) => {
    const variants = {
      kiloan: 'default',
      selimut: 'secondary',
      bed_cover: 'outline',
      kaos: 'destructive',
      lain: 'secondary'
    };
    return variants[jenis as keyof typeof variants] || 'default';
  };

  return (
    <SidebarWrapper
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-6">
                  <div className="min-w-0">
                    <h1 className="text-3xl font-semibold leading-tight">Manajemen Paket</h1>
                    <p className="text-muted-foreground mt-1">Kelola paket layanan laundry</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full lg:w-auto lg:flex-row lg:items-center lg:gap-4 lg:shrink-0 mt-2 lg:mt-0">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full lg:w-auto" onClick={() => setDialogOpen(true)}>
                          <IconPlus className="mr-2 h-4 w-4" />
                          Tambah Paket
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingPackage ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
                          <DialogDescription>
                            {editingPackage ? "Update informasi paket" : "Tambahkan paket layanan baru"}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nama_paket">Nama Paket</Label>
                            <div className="relative">
                              <IconPackage className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="nama_paket"
                                placeholder="Masukkan nama paket"
                                value={formData.nama_paket}
                                onChange={(e) => setFormData({ ...formData, nama_paket: e.target.value })}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="jenis">Jenis Paket</Label>
                            <Select value={formData.jenis} onValueChange={(value) => setFormData({ ...formData, jenis: value })} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis paket" />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                <SelectItem value="kiloan">Kiloan</SelectItem>
                                <SelectItem value="selimut">Selimut</SelectItem>
                                <SelectItem value="bed_cover">Bed Cover</SelectItem>
                                <SelectItem value="kaos">Kaos</SelectItem>
                                <SelectItem value="lain">Lainnya</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="harga">Harga</Label>
                            <div className="relative">
                              <IconCurrencyDollar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="harga"
                                type="number"
                                placeholder="Masukkan harga"
                                value={formData.harga}
                                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="id_outlet">Outlet</Label>
                            <Select value={formData.id_outlet} onValueChange={(value) => setFormData({ ...formData, id_outlet: value })} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih outlet" />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                {outlets.map((outlet) => (
                                  <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                    {outlet.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={handleDialogClose}>
                              Batal
                            </Button>
                            <Button type="submit">
                              {editingPackage ? "Update" : "Simpan"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Paket</CardTitle>
          <CardDescription>
            Total {packages.length} paket tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Paket</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>{pkg.id}</TableCell>
                    <TableCell className="font-medium">{pkg.nama_paket}</TableCell>
                    <TableCell>
                      <Badge variant={getJenisVariant(pkg.jenis) as any}>
                        {getJenisLabel(pkg.jenis)}
                      </Badge>
                    </TableCell>
                    <TableCell>Rp {pkg.harga.toLocaleString('id-ID')}</TableCell>
                    <TableCell>{pkg.tb_outlet.nama}</TableCell>
                    <TableCell>{new Date(pkg.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pkg)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(pkg.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarWrapper>
  );
}
