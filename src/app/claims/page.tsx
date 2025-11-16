'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Eye, Search, Filter, Calendar, Building, User, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { sr } from 'date-fns/locale'

interface Claim {
  id: string
  osiguranik: string
  radnaJedinica: string
  vrsta: string
  objekat: string
  brojPolise: string
  brojUseljenih: number
  vrstaStete: string
  uzrokStete: string
  veterinar: string
  brojLicence: string
  prijavaOd: string
  prijavaDo: string
  status: string
  createdAt: string
  dailyRecords: DailyRecord[]
}

interface DailyRecord {
  id: string
  datum: string
  brojnoStanje: number
  uginulo: number
  dijagnoza: string
  terapija: string
}

const statusColors = {
  U_RADU: 'bg-blue-100 text-blue-800',
  PODNETA: 'bg-purple-100 text-purple-800',
  U_OBRADI: 'bg-yellow-100 text-yellow-800',
  ODOBRENA: 'bg-green-100 text-green-800',
  ODBIJENA: 'bg-red-100 text-red-800'
}

const statusLabels = {
  U_RADU: 'U radu',
  PODNETA: 'Podneta',
  U_OBRADI: 'U obradi',
  ODOBRENA: 'Odobrena',
  ODBIJENA: 'Odbijena'
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([])
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClaims()
  }, [])

  useEffect(() => {
    filterClaims()
  }, [claims, searchTerm, statusFilter])

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/claims')
      const data = await response.json()
      // API now returns array directly, not wrapped in {claims: []}
      setClaims(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterClaims = () => {
    let filtered = claims

    if (searchTerm) {
      filtered = filtered.filter(claim =>
        claim.osiguranik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.vrsta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.brojPolise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.radnaJedinica.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter)
    }

    setFilteredClaims(filtered)
  }

  const exportClaim = async (claimId: string) => {
    try {
      const response = await fetch('/api/claims/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claimId }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `prijava-stete-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting claim:', error)
    }
  }

  const calculateSummary = (claim: Claim) => {
    const totalUginulo = claim.dailyRecords.reduce((sum, record) => sum + record.uginulo, 0)
    const prosek = claim.dailyRecords.length > 0 ? (totalUginulo / claim.dailyRecords.length).toFixed(1) : '0.0'
    const procenat = ((totalUginulo / claim.brojUseljenih) * 100).toFixed(2)
    
    return {
      totalUginulo,
      prosek,
      procenat
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Učitavanje prijava...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-2">📋 Upravljanje prijavama štete</h1>
          <p className="text-center text-primary-foreground/80">
            Pregled i upravljanje svim prijavama štete na živini
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filteri i pretraga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Pretraži po osiguraniku, vrsti, polisi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  Sve
                </Button>
                <Button
                  variant={statusFilter === 'U_RADU' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('U_RADU')}
                >
                  U radu
                </Button>
                <Button
                  variant={statusFilter === 'PODNETA' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('PODNETA')}
                >
                  Podnete
                </Button>
                <Button
                  variant={statusFilter === 'U_OBRADI' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('U_OBRADI')}
                >
                  U obradi
                </Button>
                <Button
                  variant={statusFilter === 'ODOBRENA' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ODOBRENA')}
                >
                  Odobrene
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prijave štete ({filteredClaims.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Osiguranik</TableHead>
                    <TableHead>Vrsta</TableHead>
                    <TableHead>Polisa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum prijave</TableHead>
                    <TableHead>Uginulo</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => {
                    const summary = calculateSummary(claim)
                    return (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{claim.osiguranik}</div>
                            <div className="text-sm text-muted-foreground">{claim.radnaJedinica}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{claim.vrsta}</div>
                            <div className="text-sm text-muted-foreground">{claim.objekat}</div>
                          </div>
                        </TableCell>
                        <TableCell>{claim.brojPolise}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[claim.status as keyof typeof statusColors]}>
                            {statusLabels[claim.status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(claim.createdAt), 'dd.MM.yyyy.')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-bold text-red-600">{summary.totalUginulo}</div>
                            <div className="text-sm text-muted-foreground">({summary.procenat}%)</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedClaim(claim)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Pregled prijave štete</DialogTitle>
                                  <DialogDescription>
                                    Detaljni prikaz prijave štete na živini
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedClaim && (
                                  <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2">
                                          <Building className="h-4 w-4" />
                                          Osnovni podaci
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                          <div><strong>Osiguranik:</strong> {selectedClaim.osiguranik}</div>
                                          <div><strong>Radna jedinica:</strong> {selectedClaim.radnaJedinica}</div>
                                          <div><strong>Vrsta:</strong> {selectedClaim.vrsta}</div>
                                          <div><strong>Objekat:</strong> {selectedClaim.objekat}</div>
                                          <div><strong>Broj polise:</strong> {selectedClaim.brojPolise}</div>
                                          <div><strong>Useljeno:</strong> {selectedClaim.brojUseljenih} kom</div>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2">
                                          <AlertTriangle className="h-4 w-4" />
                                          Podaci o šteti
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                          <div><strong>Vrsta štete:</strong> {selectedClaim.vrstaStete}</div>
                                          <div><strong>Uzrok štete:</strong> {selectedClaim.uzrokStete}</div>
                                          <div><strong>Veterinar:</strong> {selectedClaim.veterinar}</div>
                                          <div><strong>Licenca:</strong> {selectedClaim.brojLicence}</div>
                                          <div><strong>Period:</strong> {format(new Date(selectedClaim.prijavaOd), 'dd.MM.yyyy.')} - {format(new Date(selectedClaim.prijavaDo), 'dd.MM.yyyy.')}</div>
                                          <div><strong>Status:</strong> 
                                            <Badge className={`ml-2 ${statusColors[selectedClaim.status as keyof typeof statusColors]}`}>
                                              {statusLabels[selectedClaim.status as keyof typeof statusLabels]}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Daily Records */}
                                    <div className="space-y-2">
                                      <h4 className="font-semibold">Dnevni zapisnici štete</h4>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Datum</TableHead>
                                              <TableHead>Brojno stanje</TableHead>
                                              <TableHead>Uginulo</TableHead>
                                              <TableHead>Dijagnoza</TableHead>
                                              <TableHead>Terapija</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedClaim.dailyRecords.map((record) => (
                                              <TableRow key={record.id}>
                                                <TableCell>{format(new Date(record.datum), 'dd.MM.yyyy.')}</TableCell>
                                                <TableCell>{record.brojnoStanje}</TableCell>
                                                <TableCell className="font-bold text-red-600">{record.uginulo}</TableCell>
                                                <TableCell>{record.dijagnoza}</TableCell>
                                                <TableCell>{record.terapija || '-'}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>

                                    <Separator />

                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="text-center p-4 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{calculateSummary(selectedClaim).totalUginulo}</div>
                                        <div className="text-sm text-muted-foreground">Total uginulih</div>
                                      </div>
                                      <div className="text-center p-4 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{calculateSummary(selectedClaim).prosek}</div>
                                        <div className="text-sm text-muted-foreground">Prosečno dnevno</div>
                                      </div>
                                      <div className="text-center p-4 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{calculateSummary(selectedClaim).procenat}%</div>
                                        <div className="text-sm text-muted-foreground">Procenat od useljenih</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => exportClaim(claim.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}