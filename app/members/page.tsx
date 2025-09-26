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
import { IconPlus, IconEdit, IconTrash, IconUser, IconPhone, IconMapPin } from "@tabler/icons-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/sidebar-wrapper";

interface Member {
  id: number;
  nama: string;
  alamat?: string;
  jenis_kelamin?: 'L' | 'P';
  tlp?: string;
  created_at: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    jenis_kelamin: "",
    tlp: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data member");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members';
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingMember ? "Member berhasil diperbarui" : "Member berhasil ditambahkan");
        fetchMembers();
        handleDialogClose();
      } else {
        toast.error(result.error || "Gagal menyimpan member");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      nama: member.nama,
      alamat: member.alamat || "",
      jenis_kelamin: member.jenis_kelamin || "",
      tlp: member.tlp || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus member ini?")) {
      try {
        const response = await fetch(`/api/members/${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          toast.success("Member berhasil dihapus");
          fetchMembers();
        } else {
          toast.error(result.error || "Gagal menghapus member");
        }
      } catch (error) {
        toast.error("Gagal menghapus member");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      alamat: "",
      jenis_kelamin: "",
      tlp: "",
    });
    setEditingMember(null);
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
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-6">
                  <div className="min-w-0">
                    <h1 className="text-3xl font-semibold leading-tight">Manajemen Member</h1>
                    <p className="text-muted-foreground mt-1">Kelola data member laundry</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full lg:w-auto lg:flex-row lg:items-center lg:gap-4 lg:shrink-0 mt-2 lg:mt-0">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full lg:w-auto" onClick={() => setDialogOpen(true)}>
                          <IconPlus className="mr-2 h-4 w-4" />
                          Tambah Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingMember ? "Edit Member" : "Tambah Member Baru"}</DialogTitle>
                          <DialogDescription>
                            {editingMember ? "Update informasi member" : "Tambahkan member baru ke sistem"}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="nama">Nama Lengkap</Label>
                            <div className="relative">
                              <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="nama"
                                placeholder="Masukkan nama lengkap"
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
                                placeholder="Masukkan alamat"
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                            <Select value={formData.jenis_kelamin} onValueChange={(value) => setFormData({ ...formData, jenis_kelamin: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                              <SelectContent className="z-50">
                                <SelectItem value="L">Laki-laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
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
                              {editingMember ? "Update" : "Simpan"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Member</CardTitle>
          <CardDescription>
            Total {members.length} member terdaftar
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.id}</TableCell>
                    <TableCell className="font-medium">{member.nama}</TableCell>
                    <TableCell>{member.alamat || "-"}</TableCell>
                    <TableCell>
                      {member.jenis_kelamin ? (
                        <Badge variant={member.jenis_kelamin === 'L' ? 'default' : 'secondary'}>
                          {member.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{member.tlp || "-"}</TableCell>
                    <TableCell>{new Date(member.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
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
