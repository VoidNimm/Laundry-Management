"use client";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import {
  IconTrash,
  IconPlus,
  IconCalculator,
  IconShoppingCart,
  IconReceipt,
  IconPercentage,
  IconCalendar,
  IconCreditCard,
  IconUser,
  IconStorm,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface Outlet {
  id: number;
  nama: string;
}

interface Member {
  id: number;
  nama: string;
}

interface Package {
  id: number;
  nama_paket: string;
  jenis: string;
  harga: number;
}

interface TransaksiFormProps {
  outlets?: Outlet[];
  members?: Member[];
  packages?: Package[];
}

const itemSchema = z.object({
  paket_id: z.string().min(1, "Paket wajib dipilih"),
  qty: z.coerce.number().min(0.1, "Qty tidak boleh nol atau negatif"),
  keterangan: z.string().optional(),
});

const formSchema = z.object({
  id_outlet: z.string().min(1, "Outlet wajib dipilih"),
  id_member: z.string().optional().or(z.literal("none")),
  batas_waktu: z.date().optional(),
  tgl_bayar: z.date().optional(),
  biaya_tambahan: z.union([z.coerce.number(), z.literal(null)]).optional(),
  diskon: z.union([z.coerce.number(), z.literal(null)]).optional(),
  pajak: z.union([z.coerce.number(), z.literal(null)]).optional(),
  status: z.enum(["baru", "proses", "selesai", "diambil"]).default("baru"),
  dibayar: z.enum(["dibayar", "belum_dibayar"]).default("belum_dibayar"),
  items: z.array(itemSchema).min(1, "Tambahkan minimal 1 paket"),
});

export default function TransaksiForm({
  outlets: initialOutlets,
  members: initialMembers,
  packages: initialPackages,
}: TransaksiFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [outlets, setOutlets] = useState<Outlet[]>(initialOutlets || []);
  const [members, setMembers] = useState<Member[]>(initialMembers || []);
  const [packages, setPackages] = useState<Package[]>(initialPackages || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      id_member: "none",
      status: "baru",
      dibayar: "belum_dibayar",
      biaya_tambahan: 0,
      diskon: 0,
      pajak: 11,
      items: [{ paket_id: "", qty: 1, keterangan: "" }],
    },
  });

  useEffect(() => {
    if (!initialOutlets || !initialMembers || !initialPackages) {
      fetchData();
    }
  }, [initialOutlets, initialMembers, initialPackages]);

  const fetchData = async () => {
    try {
      const [outletsRes, membersRes, packagesRes] = await Promise.all([
        fetch("/api/outlets"),
        fetch("/api/members"),
        fetch("/api/packages"),
      ]);

      const [outletsData, membersData, packagesData] = await Promise.all([
        outletsRes.json(),
        membersRes.json(),
        packagesRes.json(),
      ]);

      if (outletsData.success) setOutlets(outletsData.data);
      if (membersData.success) setMembers(membersData.data);
      if (packagesData.success) setPackages(packagesData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const calculateTotals = useCallback(() => {
    // Early return if packages is not available yet
    if (!packages || !Array.isArray(packages)) {
      return;
    }

    const currentValues = form.getValues();
    let currentSubtotal = 0;

    // Calculate subtotal from items (following PHP logic)
    currentValues.items.forEach((item) => {
      const paket = packages.find((p) => p.id.toString() === item.paket_id);
      if (paket && item.qty > 0) {
        currentSubtotal += (item.qty || 0) * paket.harga;
      }
    });
    setSubtotal(currentSubtotal);

    const biayaTambahan =
      parseFloat(currentValues.biaya_tambahan?.toString() || "0") || 0;
    const diskonInput =
      parseFloat(currentValues.diskon?.toString() || "0") || 0;
    const pajakPercent = 11; // Fixed 11% tax

    // Normalize/correct numbers (following PHP validation logic)
    let diskonPercent = diskonInput;
    if (diskonPercent < 0) diskonPercent = 0;
    if (diskonPercent > 100) diskonPercent = 100;

    // Calculate discount as percentage of (subtotal + biaya tambahan)
    const baseAmount = currentSubtotal + biayaTambahan;
    const diskonValue = baseAmount * (diskonPercent / 100);
    const afterDiscount = Math.max(0, baseAmount - diskonValue);
    const pajakValue = afterDiscount * (pajakPercent / 100);
    const finalTotal = afterDiscount + pajakValue;
    setTotal(finalTotal);
  }, [form, packages]);

  useEffect(() => {
    const subscription = form.watch(() => {
      calculateTotals();
    });
    return () => subscription.unsubscribe();
  }, [form, calculateTotals]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/transaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          id_member: values.id_member === "none" ? null : values.id_member,
          biaya_tambahan: values.biaya_tambahan || 0,
          diskon: values.diskon || 0,
          pajak: 11,
          subtotal: subtotal,
          total: total,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Transaksi berhasil disimpan!");

        if (form.getValues("dibayar") === "dibayar") {
          setTimeout(() => {
            toast.success("Pembayaran berhasil diproses!");
          }, 1000);
        }

        form.reset();
        router.push("/transaksi");
      } else {
        toast.error(result.error || "Gagal menyimpan transaksi");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Gagal mengirim form. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information - Outlet and Member */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-4">
          <FormField
            control={form.control}
            name="id_outlet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <IconShoppingCart className="inline mr-1" />
                  Outlet
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Outlet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {outlets?.map((outlet) => (
                      <SelectItem key={outlet.id} value={outlet.id.toString()}>
                        {outlet.nama}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_member"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  <IconUser className="inline mr-1" />
                  Member
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value && field.value !== "none"
                          ? members?.find(
                              (member) => member.id.toString() === field.value
                            )?.nama || "Pilih Member"
                          : field.value === "none"
                          ? "Tidak ada member"
                          : "Pilih Member (Opsional)"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Cari member..." />
                      <CommandList>
                        <CommandEmpty>Member tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              form.setValue("id_member", "none");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === "none"
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            Tidak ada member
                          </CommandItem>
                          {members?.map((member) => (
                            <CommandItem
                              key={member.id}
                              value={member.nama}
                              onSelect={() => {
                                form.setValue(
                                  "id_member",
                                  member.id.toString()
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === member.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {member.nama}
                            </CommandItem>
                          )) || []}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date, Status, and Payment Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-4">
          <FormField
            control={form.control}
            name="batas_waktu"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  <IconCalendar className="inline mr-1" />
                  Batas Waktu
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <IconReceipt className="inline mr-1" />
                  Status
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="baru">Baru</SelectItem>
                    <SelectItem value="proses">Proses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="diambil">Diambil</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dibayar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <IconCreditCard className="inline mr-1" />
                  Pembayaran
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Status Bayar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="belum_dibayar">Belum Dibayar</SelectItem>
                    <SelectItem value="dibayar">Dibayar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment Date - Only show if dibayar is selected */}
        {form.watch("dibayar") === "dibayar" && (
          <div className="mt-6">
            <FormField
              control={form.control}
              name="tgl_bayar"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    <IconCalendar className="inline mr-1" />
                    Tanggal Bayar
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal bayar</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Items Section */}
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Paket Laundry</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ paket_id: "", qty: 1, keterangan: "" })}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Tambah Paket
            </Button>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 sm:px-3 font-medium text-sm">
                    Paket
                  </th>
                  <th className="text-left py-3 px-2 sm:px-3 font-medium text-sm">
                    Qty
                  </th>
                  <th className="text-left py-3 px-2 sm:px-3 font-medium text-sm">
                    Harga
                  </th>
                  <th className="text-left py-3 px-2 sm:px-3 font-medium text-sm">
                    Subtotal
                  </th>
                  <th className="text-left py-3 px-2 sm:px-3 font-medium text-sm">
                    Keterangan
                  </th>
                  <th className="text-left py-3 px-2 sm:px-3 font-medium text-sm">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2 sm:px-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.paket_id`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <Select
                              onValueChange={itemField.onChange}
                              defaultValue={itemField.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full min-w-[180px] sm:min-w-0">
                                  <SelectValue placeholder="Pilih Paket" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {packages?.map((paket) => (
                                  <SelectItem
                                    key={paket.id}
                                    value={paket.id.toString()}
                                  >
                                    {paket.nama_paket} ({paket.jenis}) - Rp.{" "}
                                    {paket.harga.toLocaleString("id-ID")}
                                  </SelectItem>
                                )) || []}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-3 px-2 sm:px-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.qty`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...itemField}
                                className="w-16 sm:w-20"
                                value={itemField.value || ""}
                                min="0"
                                step="0.1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-3 px-2 sm:px-2 text-muted-foreground text-sm">
                      Rp.{" "}
                      {(
                        packages?.find(
                          (p) =>
                            p.id.toString() ===
                            form.watch(`items.${index}.paket_id`)
                        )?.harga || 0
                      ).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-2 sm:px-3 font-semibold text-sm">
                      Rp.{" "}
                      {(
                        (packages?.find(
                          (p) =>
                            p.id.toString() ===
                            form.watch(`items.${index}.paket_id`)
                        )?.harga || 0) * (form.watch(`items.${index}.qty`) || 0)
                      ).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-2 sm:px-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.keterangan`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Keterangan..."
                                {...itemField}
                                className="w-full min-w-[120px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="py-3 px-2 sm:px-3">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="biaya_tambahan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <IconCalculator className="inline mr-1" />
                    Biaya Tambahan
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Biaya tambahan (opsional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diskon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <IconPercentage className="inline mr-1" />
                    Diskon (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ""}
                      min="0"
                      max="100"
                    />
                  </FormControl>
                  <FormDescription>
                    Diskon dalam persen (0-100%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Summary */}
          <div className="bg-muted/50 p-4 sm:p-6 rounded-lg space-y-3 border">
            <h4 className="font-medium text-lg mb-3">Ringkasan Pembayaran</h4>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp. {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Tambahan:</span>
              <span>
                Rp.{" "}
                {(
                  parseFloat(form.watch("biaya_tambahan")?.toString() || "0") ||
                  0
                ).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                Diskon (
                {parseFloat(form.watch("diskon")?.toString() || "0") || 0}%):
              </span>
              <span>
                - Rp.{" "}
                {(
                  (subtotal +
                    (parseFloat(
                      form.watch("biaya_tambahan")?.toString() || "0"
                    ) || 0)) *
                  ((parseFloat(form.watch("diskon")?.toString() || "0") || 0) /
                    100)
                ).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pajak (11%):</span>
              <span>
                Rp.{" "}
                {(
                  (subtotal +
                    (parseFloat(
                      form.watch("biaya_tambahan")?.toString() || "0"
                    ) || 0) -
                    (subtotal +
                      (parseFloat(
                        form.watch("biaya_tambahan")?.toString() || "0"
                      ) || 0)) *
                      ((parseFloat(form.watch("diskon")?.toString() || "0") ||
                        0) /
                        100)) *
                  0.11
                ).toLocaleString("id-ID")}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>Rp. {total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <Button
            type="submit"
            className="w-full h-12 text-base sm:text-lg font-medium"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
