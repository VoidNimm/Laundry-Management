"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconPlus, IconEdit, IconTrash, IconMapPin, IconPhone, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

interface Outlet {
  id: number;
  nama: string;
  alamat?: string;
  tlp?: string;
  created_at: string;
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    tlp: "",
  });

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      const response = await fetch('/api/outlets');
      const result = await response.json();
      if (result.success) {
        setOutlets(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data outlet");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingOutlet ? `/api/outlets/${editingOutlet.id}` : '/api/outlets';
      const method = editingOutlet ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingOutlet ? "Outlet berhasil diupdate" : "Outlet berhasil ditambahkan");
        setDialogOpen(false);
        resetForm();
        fetchOutlets();
      } else {
        toast.error(result.error || "Gagal menyimpan outlet");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      nama: outlet.nama,
      alamat: outlet.alamat || "",
      tlp: outlet.tlp || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus outlet ini?")) return;

    try {
      const response = await fetch(`/api/outlets/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Outlet berhasil dihapus");
        fetchOutlets();
      } else {
        toast.error(result.error || "Gagal menghapus outlet");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      alamat: "",
      tlp: "",
    });
    setEditingOutlet(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
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
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Manajemen Outlet</h1>
          <p className="text-muted-foreground mt-1">Kelola data outlet laundry</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Tambah Outlet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOutlet ? "Edit Outlet" : "Tambah Outlet Baru"}</DialogTitle>
              <DialogDescription>
                {editingOutlet ? "Update informasi outlet" : "Tambahkan outlet baru ke sistem"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Outlet</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nama"
                    placeholder="Masukkan nama outlet"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <div className="relative">
                  <IconMapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="alamat"
                    placeholder="Masukkan alamat outlet"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tlp">Nomor Telepon</Label>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tlp"
                    placeholder="Masukkan nomor telepon"
                    value={formData.tlp}
                    onChange={(e) => setFormData({ ...formData, tlp: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingOutlet ? "Update" : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Outlet</CardTitle>
          <CardDescription>
            Total {outlets.length} outlet terdaftar
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
                  <TableHead>Nama Outlet</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlets.map((outlet) => (
                  <TableRow key={outlet.id}>
                    <TableCell>{outlet.id}</TableCell>
                    <TableCell className="font-medium">{outlet.nama}</TableCell>
                    <TableCell>{outlet.alamat || "-"}</TableCell>
                    <TableCell>{outlet.tlp || "-"}</TableCell>
                    <TableCell>{new Date(outlet.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(outlet)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(outlet.id)}
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
