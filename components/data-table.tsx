"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconUser } from "@tabler/icons-react"

interface TopMember {
  id: number
  nama: string
  total_transaksi: number
  total_belanja: number
  last_visit: string
}

export function DataTable() {
  const [topMembers, setTopMembers] = useState<TopMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopMembers()
  }, [])

  const fetchTopMembers = async () => {
    try {
      const response = await fetch('/api/members/top')
      if (response.ok) {
        const data = await response.json()
        setTopMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching top members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="m-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Top Member
          </CardTitle>
          <CardDescription>Member dengan transaksi terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="ml-5.5 mr-5.5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUser className="h-5 w-5" />
          Top Member
        </CardTitle>
        <CardDescription>Member dengan transaksi terbanyak</CardDescription>
      </CardHeader>
      <CardContent>
        {topMembers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Belum ada data member
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="text-center">Transaksi</TableHead>
                <TableHead className="text-right">Total Belanja</TableHead>
                <TableHead className="text-center">Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topMembers.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{member.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {member.total_transaksi} transaksi
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    Rp {member.total_belanja.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {new Date(member.last_visit).toLocaleDateString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
