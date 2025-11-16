'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Save, FileText, Download, Mail, RotateCcw, Calculator, List, Search, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { sr } from 'date-fns/locale'

interface DailyRecord {
  id: string
  datum: string
  brojnoStanje: number
  uginulo: number
  dijagnoza: string
  terapija: string
}

interface ClaimData {
  osiguranik: string
  radnaJedinica: string
  vrsta: string
  kategorija: string
  objekat: string
  bpg: string
  hid: string
  brojPolise: string
  datumPocetka: string
  datumIsteka: string
  brojUseljenih: number
  datumUseljenja: string
  vrstaStete: string
  uzrokStete: string
  veterinar: string
  brojLicence: string
  prijavaOd: string
  prijavaDo: string
  dailyRecords: DailyRecord[]
}

const initialClaimData: ClaimData = {
  osiguranik: 'Spasić Farm doo Stalać',
  radnaJedinica: 'Ćićevac, Lovačko Polje',
  vrsta: 'Tab1',
  kategorija: 'Kokoši',
  objekat: 'FĆ 1',
  bpg: '744247000750',
  hid: '744328008498',
  brojPolise: '806411',
  datumPocetka: '2025-01-01',
  datumIsteka: '2025-12-31',
  brojUseljenih: 19499,
  datumUseljenja: '2025-01-01',
  vrstaStete: 'Uginuće',
  uzrokStete: 'Bolest',
  veterinar: 'Jovan Petrovski',
  brojLicence: '9987',
  prijavaOd: format(new Date(), 'yyyy-MM-dd'),
  prijavaDo: format(new Date(), 'yyyy-MM-dd'),
  dailyRecords: [
    {
      id: '1',
      datum: format(new Date(), 'yyyy-MM-dd'),
      brojnoStanje: 19494,
      uginulo: 5,
      dijagnoza: 'Legenot',
      terapija: 'AD3E, B-complex'
    }
  ]
}

const initialLslData: ClaimData = {
  ...initialClaimData,
  vrsta: 'Tab2',
  brojUseljenih: 4123,
  dailyRecords: [
    {
      id: '1',
      datum: format(new Date(), 'yyyy-MM-dd'),
      brojnoStanje: 4123,
      uginulo: 1,
      dijagnoza: 'Infarctus cordis',
      terapija: '-'
    }
  ]
}

// ClaimForm Component - moved outside to prevent re-creation on every render
const ClaimForm = React.memo(({ 
  data, 
  setData, 
  type,
  isLoading,
  status,
  claimId,
  saveClaim,
  resetForm,
  exportToExcel,
  openEmailDialog,
  addDailyRecord,
  removeDailyRecord,
  updateDailyRecord,
  calculateSummary
}: { 
  data: ClaimData
  setData: React.Dispatch<React.SetStateAction<ClaimData>>
  type: 'lb' | 'lsl'
  isLoading: boolean
  status: string
  claimId: string | null
  saveClaim: (type: 'lb' | 'lsl') => void
  resetForm: (type: 'lb' | 'lsl') => void
  exportToExcel: (type: 'lb' | 'lsl' | 'all') => void
  openEmailDialog: () => void
  addDailyRecord: (type: 'lb' | 'lsl') => void
  removeDailyRecord: (type: 'lb' | 'lsl', id: string) => void
  updateDailyRecord: (type: 'lb' | 'lsl', id: string, field: keyof DailyRecord, value: string | number) => void
  calculateSummary: (data: ClaimData) => { totalUginulo: number; prosek: string; procenat: string }
}) => {
  const summary = calculateSummary(data)
  const isLocked = status === 'PODNETA'

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isLocked && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-2 text-yellow-800">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Podneta
                </Badge>
                <span className="text-sm font-medium">
                  Ova prijava je već podneta i ne može se menjati. Samo pregled je omogućen.
                </span>
              </div>
              <span className="text-xs text-yellow-700">
                Za novu prijavu za novi period, kliknite "Resetuj"
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Osnovni podaci
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${type}-osiguranik`}>Osiguranik</Label>
              <Input
                id={`${type}-osiguranik`}
                value={data.osiguranik}
                onChange={(e) => setData(prev => ({ ...prev, osiguranik: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-radnaJedinica`}>Radna jedinica/farma</Label>
              <Input
                id={`${type}-radnaJedinica`}
                value={data.radnaJedinica}
                onChange={(e) => setData(prev => ({ ...prev, radnaJedinica: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-vrsta`}>Vrsta/Kategorija</Label>
              <Input
                id={`${type}-vrsta`}
                value={data.vrsta}
                onChange={(e) => setData(prev => ({ ...prev, vrsta: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-objekat`}>Objekat</Label>
              <Input
                id={`${type}-objekat`}
                value={data.objekat}
                onChange={(e) => setData(prev => ({ ...prev, objekat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-bpg`}>BPG</Label>
              <Input
                id={`${type}-bpg`}
                value={data.bpg}
                onChange={(e) => setData(prev => ({ ...prev, bpg: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-hid`}>HID</Label>
              <Input
                id={`${type}-hid`}
                value={data.hid}
                onChange={(e) => setData(prev => ({ ...prev, hid: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-brojPolise`}>Broj polise</Label>
              <Input
                id={`${type}-brojPolise`}
                value={data.brojPolise}
                onChange={(e) => setData(prev => ({ ...prev, brojPolise: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-datumPocetka`}>Datum početka osiguranja</Label>
              <Input
                id={`${type}-datumPocetka`}
                type="date"
                value={data.datumPocetka}
                onChange={(e) => setData(prev => ({ ...prev, datumPocetka: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-datumIsteka`}>Datum isteka osiguranja</Label>
              <Input
                id={`${type}-datumIsteka`}
                type="date"
                value={data.datumIsteka}
                onChange={(e) => setData(prev => ({ ...prev, datumIsteka: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-brojUseljenih`}>Broj useljenih</Label>
              <Input
                id={`${type}-brojUseljenih`}
                type="number"
                value={data.brojUseljenih}
                onChange={(e) => setData(prev => ({ ...prev, brojUseljenih: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-datumUseljenja`}>Datum useljenja</Label>
              <Input
                id={`${type}-datumUseljenja`}
                type="date"
                value={data.datumUseljenja}
                onChange={(e) => setData(prev => ({ ...prev, datumUseljenja: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Podaci o šteti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${type}-vrstaStete`}>Vrsta štete</Label>
              <Select value={data.vrstaStete} onValueChange={(value) => setData(prev => ({ ...prev, vrstaStete: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite vrstu štete" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Uginuće">Uginuće</SelectItem>
                  <SelectItem value="Prinudno klanje">Prinudno klanje</SelectItem>
                  <SelectItem value="Prinudno ubijanje">Prinudno ubijanje</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-uzrokStete`}>Uzrok štete</Label>
              <Select value={data.uzrokStete} onValueChange={(value) => setData(prev => ({ ...prev, uzrokStete: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite uzrok štete" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bolest">Bolest</SelectItem>
                  <SelectItem value="Nesrećni slučaj">Nesrećni slučaj</SelectItem>
                  <SelectItem value="Ekstremne temperature">Ekstremne temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-veterinar`}>Veterinar</Label>
              <Input
                id={`${type}-veterinar`}
                value={data.veterinar}
                onChange={(e) => setData(prev => ({ ...prev, veterinar: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-brojLicence`}>Broj licence</Label>
              <Input
                id={`${type}-brojLicence`}
                value={data.brojLicence}
                onChange={(e) => setData(prev => ({ ...prev, brojLicence: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-prijavaOd`}>Prijava štete od</Label>
              <Input
                id={`${type}-prijavaOd`}
                type="date"
                value={data.prijavaOd}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setData(prev => {
                    // Calculate date one month later
                    let prijavaDo = prev.prijavaDo;
                    if (newDate) {
                      const fromDate = new Date(newDate);
                      fromDate.setMonth(fromDate.getMonth() + 1);
                      prijavaDo = fromDate.toISOString().split('T')[0];
                    }
                    return { ...prev, prijavaOd: newDate, prijavaDo };
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-prijavaDo`}>Prijava štete do</Label>
              <Input
                id={`${type}-prijavaDo`}
                type="date"
                value={data.prijavaDo}
                onChange={(e) => setData(prev => ({ ...prev, prijavaDo: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dnevni zapisnici štete
            </span>
            <Button onClick={() => addDailyRecord(type)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj novi dan
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Brojno stanje</TableHead>
                  <TableHead>Uginulo</TableHead>
                  <TableHead>Dijagnoza</TableHead>
                  <TableHead>Terapija</TableHead>
                  <TableHead className="w-[100px]">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.dailyRecords.map((record, index) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Input
                        type="date"
                        value={record.datum}
                        onChange={(e) => updateDailyRecord(type, record.id, 'datum', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={record.brojnoStanje}
                        onChange={(e) => updateDailyRecord(type, record.id, 'brojnoStanje', parseInt(e.target.value) || 0)}
                        className="w-full"
                        disabled={index > 0}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={record.uginulo}
                        onChange={(e) => updateDailyRecord(type, record.id, 'uginulo', parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.dijagnoza}
                        onChange={(e) => updateDailyRecord(type, record.id, 'dijagnoza', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={record.terapija}
                        onChange={(e) => updateDailyRecord(type, record.id, 'terapija', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDailyRecord(type, record.id)}
                        disabled={data.dailyRecords.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rezime štete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.totalUginulo}</div>
              <div className="text-sm text-muted-foreground">Total uginulih</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.prosek}</div>
              <div className="text-sm text-muted-foreground">Prosečno dnevno</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{summary.procenat}%</div>
              <div className="text-sm text-muted-foreground">Procenat od useljenih</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => saveClaim(type)} disabled={isLoading || isLocked}>
          <Save className="h-4 w-4 mr-2" />
          Sačuvaj prijavu
        </Button>
        <Button variant="outline" onClick={openEmailDialog} title="Otvara podrazumevani email klijent" disabled={isLocked}>
          <Mail className="h-4 w-4 mr-2" />
          Pošalji email
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <FileText className="h-4 w-4 mr-2" />
          Štampaj
        </Button>
        <Button variant="outline" onClick={() => exportToExcel(type)}>
          <Download className="h-4 w-4 mr-2" />
          Izvoz Excel
        </Button>
        <Button variant="destructive" onClick={() => resetForm(type)} disabled={isLocked}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Resetuj
        </Button>
      </div>
    </div>
  )
})

ClaimForm.displayName = 'ClaimForm'

export default function Home() {
  const [lbData, setLbData] = useState<ClaimData>(initialClaimData)
  const [lslData, setLslData] = useState<ClaimData>(initialLslData)
  const [lbClaimId, setLbClaimId] = useState<string | null>(null)
  const [lslClaimId, setLslClaimId] = useState<string | null>(null)
  const [lbStatus, setLbStatus] = useState<string>('U_RADU')
  const [lslStatus, setLslStatus] = useState<string>('U_RADU')
  const [activeTab, setActiveTab] = useState('lb')
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [resetTarget, setResetTarget] = useState<'lb' | 'lsl' | null>(null)
  const [emailSelection, setEmailSelection] = useState({ lb: true, lsl: true })
  const [tabNames, setTabNames] = useState({
    lb: 'Tab1',
    lsl: 'Tab2'
  })
  const [policySearch, setPolicySearch] = useState('')
  const [searchError, setSearchError] = useState('')

  const calculateSummary = (data: ClaimData) => {
    const totalUginulo = data.dailyRecords.reduce((sum, record) => sum + record.uginulo, 0)
    const prosek = data.dailyRecords.length > 0 ? (totalUginulo / data.dailyRecords.length).toFixed(1) : '0.0'
    const procenat = ((totalUginulo / data.brojUseljenih) * 100).toFixed(2)
    
    return {
      totalUginulo,
      prosek,
      procenat
    }
  }

  // Load existing U_RADU claims on mount
  React.useEffect(() => {
    const loadExistingClaims = async () => {
      try {
        const response = await fetch('/api/claims?status=U_RADU')
        if (response.ok) {
          const claims = await response.json()
          
          // Load LB claim if exists
          const lbClaim = claims.find((c: any) => c.vrsta.includes('Lohmann Brown') && !c.vrsta.includes('LSL'))
          if (lbClaim) {
            setLbData({
              osiguranik: lbClaim.osiguranik,
              radnaJedinica: lbClaim.radnaJedinica,
              vrsta: lbClaim.vrsta,
              kategorija: lbClaim.kategorija,
              objekat: lbClaim.objekat,
              bpg: lbClaim.bpg,
              hid: lbClaim.hid,
              brojPolise: lbClaim.brojPolise,
              datumPocetka: format(new Date(lbClaim.datumPocetka), 'yyyy-MM-dd'),
              datumIsteka: format(new Date(lbClaim.datumIsteka), 'yyyy-MM-dd'),
              brojUseljenih: lbClaim.brojUseljenih,
              datumUseljenja: lbClaim.datumUseljenja ? format(new Date(lbClaim.datumUseljenja), 'yyyy-MM-dd') : format(new Date(lbClaim.datumPocetka), 'yyyy-MM-dd'),
              vrstaStete: lbClaim.vrstaStete,
              uzrokStete: lbClaim.uzrokStete,
              veterinar: lbClaim.veterinar,
              brojLicence: lbClaim.brojLicence,
              prijavaOd: format(new Date(lbClaim.prijavaOd), 'yyyy-MM-dd'),
              prijavaDo: format(new Date(lbClaim.prijavaDo), 'yyyy-MM-dd'),
              dailyRecords: lbClaim.dailyRecords.map((r: any) => ({
                id: r.id,
                datum: format(new Date(r.datum), 'yyyy-MM-dd'),
                brojnoStanje: r.brojnoStanje,
                uginulo: r.uginulo,
                dijagnoza: r.dijagnoza,
                terapija: r.terapija || ''
              }))
            })
            setLbClaimId(lbClaim.id)
            setLbStatus(lbClaim.status)
          }
          
          // Load LSL claim if exists
          const lslClaim = claims.find((c: any) => c.vrsta.includes('LSL'))
          if (lslClaim) {
            setLslData({
              osiguranik: lslClaim.osiguranik,
              radnaJedinica: lslClaim.radnaJedinica,
              vrsta: lslClaim.vrsta,
              kategorija: lslClaim.kategorija,
              objekat: lslClaim.objekat,
              bpg: lslClaim.bpg,
              hid: lslClaim.hid,
              brojPolise: lslClaim.brojPolise,
              datumPocetka: format(new Date(lslClaim.datumPocetka), 'yyyy-MM-dd'),
              datumIsteka: format(new Date(lslClaim.datumIsteka), 'yyyy-MM-dd'),
              brojUseljenih: lslClaim.brojUseljenih,
              datumUseljenja: lslClaim.datumUseljenja ? format(new Date(lslClaim.datumUseljenja), 'yyyy-MM-dd') : format(new Date(lslClaim.datumPocetka), 'yyyy-MM-dd'),
              vrstaStete: lslClaim.vrstaStete,
              uzrokStete: lslClaim.uzrokStete,
              veterinar: lslClaim.veterinar,
              brojLicence: lslClaim.brojLicence,
              prijavaOd: format(new Date(lslClaim.prijavaOd), 'yyyy-MM-dd'),
              prijavaDo: format(new Date(lslClaim.prijavaDo), 'yyyy-MM-dd'),
              dailyRecords: lslClaim.dailyRecords.map((r: any) => ({
                id: r.id,
                datum: format(new Date(r.datum), 'yyyy-MM-dd'),
                brojnoStanje: r.brojnoStanje,
                uginulo: r.uginulo,
                dijagnoza: r.dijagnoza,
                terapija: r.terapija || ''
              }))
            })
            setLslClaimId(lslClaim.id)
            setLslStatus(lslClaim.status)
          }
        }
      } catch (error) {
        console.error('Error loading existing claims:', error)
      }
    }
    
    loadExistingClaims()
  }, [])

  // Update tab names when data changes
  React.useEffect(() => {
    const lbName = `${lbData.vrsta} ${lbData.objekat}`.trim()
    const lslName = `${lslData.vrsta} ${lslData.objekat}`.trim()
    setTabNames({
      lb: lbName || 'Tab1',
      lsl: lslName || 'Tab2'
    })
  }, [lbData.vrsta, lbData.objekat, lslData.vrsta, lslData.objekat])

  // Search for claims by policy number
  const searchByPolicy = async () => {
    if (!policySearch.trim()) {
      setSearchError('Molimo unesite broj polise')
      return
    }

    setIsLoading(true)
    setSearchError('')

    try {
      // Search for claims with this policy number - prioritize U_RADU status
      const response = await fetch('/api/claims')
      if (!response.ok) throw new Error('Greška pri pretraživanju')
      
      const allClaims = await response.json()
      const policyClaims = allClaims.filter((c: any) => c.brojPolise === policySearch.trim())

      if (policyClaims.length === 0) {
        setSearchError('Nisu pronađene prijave za ovaj broj polise')
        setIsLoading(false)
        return
      }

      // Prioritize U_RADU (draft) claims - these are editable
      const draftClaims = policyClaims.filter((c: any) => c.status === 'U_RADU')
      const claimsToLoad = draftClaims.length > 0 ? draftClaims : policyClaims

      // Load claims for LB and LSL
      // Since we have 2 claims per policy (one for each facility), load them by index
      const lbClaim = claimsToLoad[0] // First claim
      const lslClaim = claimsToLoad[1] // Second claim (if exists)

      if (lbClaim) {
        const lbDataToSet = {
          osiguranik: lbClaim.osiguranik,
          radnaJedinica: lbClaim.radnaJedinica,
          vrsta: lbClaim.vrsta,
          kategorija: lbClaim.kategorija,
          objekat: lbClaim.objekat,
          bpg: lbClaim.bpg,
          hid: lbClaim.hid,
          brojPolise: lbClaim.brojPolise,
          datumPocetka: lbClaim.datumPocetka.split('T')[0],
          datumIsteka: lbClaim.datumIsteka.split('T')[0],
          brojUseljenih: lbClaim.brojUseljenih,
          datumUseljenja: lbClaim.datumUseljenja ? lbClaim.datumUseljenja.split('T')[0] : lbClaim.datumPocetka.split('T')[0],
          vrstaStete: lbClaim.vrstaStete,
          uzrokStete: lbClaim.uzrokStete,
          veterinar: lbClaim.veterinar,
          brojLicence: lbClaim.brojLicence,
          prijavaOd: lbClaim.prijavaOd.split('T')[0],
          prijavaDo: lbClaim.prijavaDo.split('T')[0],
          dailyRecords: lbClaim.dailyRecords.map((r: any) => ({
            id: r.id.toString(),
            datum: r.datum.split('T')[0],
            brojnoStanje: r.brojnoStanje,
            uginulo: r.uginulo,
            dijagnoza: r.dijagnoza,
            terapija: r.terapija
          }))
        }
        setLbData(lbDataToSet)
        setLbClaimId(lbClaim.id.toString())
        setLbStatus(lbClaim.status)
      }

      if (lslClaim) {
        const lslDataToSet = {
          osiguranik: lslClaim.osiguranik,
          radnaJedinica: lslClaim.radnaJedinica,
          vrsta: lslClaim.vrsta,
          kategorija: lslClaim.kategorija,
          objekat: lslClaim.objekat,
          bpg: lslClaim.bpg,
          hid: lslClaim.hid,
          brojPolise: lslClaim.brojPolise,
          datumPocetka: lslClaim.datumPocetka.split('T')[0],
          datumIsteka: lslClaim.datumIsteka.split('T')[0],
          brojUseljenih: lslClaim.brojUseljenih,
          datumUseljenja: lslClaim.datumUseljenja ? lslClaim.datumUseljenja.split('T')[0] : lslClaim.datumPocetka.split('T')[0],
          vrstaStete: lslClaim.vrstaStete,
          uzrokStete: lslClaim.uzrokStete,
          veterinar: lslClaim.veterinar,
          brojLicence: lslClaim.brojLicence,
          prijavaOd: lslClaim.prijavaOd.split('T')[0],
          prijavaDo: lslClaim.prijavaDo.split('T')[0],
          dailyRecords: lslClaim.dailyRecords.map((r: any) => ({
            id: r.id.toString(),
            datum: r.datum.split('T')[0],
            brojnoStanje: r.brojnoStanje,
            uginulo: r.uginulo,
            dijagnoza: r.dijagnoza,
            terapija: r.terapija
          }))
        }
        setLslData(lslDataToSet)
        setLslClaimId(lslClaim.id.toString())
        setLslStatus(lslClaim.status)
      }

      // Show informative message about what was loaded
      const statusMsg = draftClaims.length > 0 
        ? `✅ Učitano ${claimsToLoad.length} radnih prijava (U radu) za polisu ${policySearch}`
        : `⚠️ Učitano ${claimsToLoad.length} prijava sa statusom "${claimsToLoad[0]?.status}". Za novu prijavu za novi period, kliknite "Resetuj".`
      
      alert(statusMsg)
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Greška pri pretraživanju prijava')
    } finally {
      setIsLoading(false)
    }
  }

  const addDailyRecord = (type: 'lb' | 'lsl') => {
    const setData = type === 'lb' ? setLbData : setLslData
    const data = type === 'lb' ? lbData : lslData
    
    const newRecord: DailyRecord = {
      id: Date.now().toString(),
      datum: format(new Date(), 'yyyy-MM-dd'),
      brojnoStanje: data.dailyRecords.length > 0 
        ? data.dailyRecords[data.dailyRecords.length - 1].brojnoStanje - data.dailyRecords[data.dailyRecords.length - 1].uginulo
        : data.brojUseljenih,
      uginulo: 0,
      dijagnoza: '',
      terapija: ''
    }
    
    setData(prev => ({
      ...prev,
      dailyRecords: [...prev.dailyRecords, newRecord]
    }))
  }

  const removeDailyRecord = (type: 'lb' | 'lsl', id: string) => {
    const setData = type === 'lb' ? setLbData : setLslData
    setData(prev => ({
      ...prev,
      dailyRecords: prev.dailyRecords.filter(record => record.id !== id)
    }))
  }

  const updateDailyRecord = (type: 'lb' | 'lsl', id: string, field: keyof DailyRecord, value: string | number) => {
    const setData = type === 'lb' ? setLbData : setLslData
    const data = type === 'lb' ? lbData : lslData
    
    setData(prev => {
      const updatedRecords = prev.dailyRecords.map(record => {
        if (record.id === id) {
          const updated = { ...record, [field]: value }
          
          // Auto-calculate brojnoStanje for subsequent records
          if (field === 'uginulo' || field === 'brojnoStanje') {
            const recordIndex = prev.dailyRecords.findIndex(r => r.id === id)
            if (recordIndex < prev.dailyRecords.length - 1) {
              const newStanje = typeof updated.brojnoStanje === 'number' && typeof updated.uginulo === 'number' 
                ? updated.brojnoStanje - updated.uginulo 
                : prev.dailyRecords[recordIndex].brojnoStanje - prev.dailyRecords[recordIndex].uginulo
              
              return updatedRecords.map((r, idx) => {
                if (idx > recordIndex) {
                  return { ...r, brojnoStanje: newStanje }
                }
                return r
              })
            }
          }
          
          return updated
        }
        return record
      })
      
      return {
        ...prev,
        dailyRecords: updatedRecords
      }
    })
  }

  const saveClaim = async (type: 'lb' | 'lsl') => {
    setIsLoading(true)
    try {
      const data = type === 'lb' ? lbData : lslData
      const claimId = type === 'lb' ? lbClaimId : lslClaimId
      const status = type === 'lb' ? lbStatus : lslStatus
      
      // Don't allow editing if status is PODNETA
      if (status === 'PODNETA') {
        alert('Ne možete menjati prijavu koja je već podneta.')
        return
      }
      
      // Validate data before sending
      if (!data.osiguranik || !data.vrsta || !data.brojPolise) {
        alert('Molimo popunite sva obavezna polja')
        return
      }
      
      if (data.dailyRecords.length === 0) {
        alert('Morate imati barem jedan dnevni zapisnik')
        return
      }
      
      const requestData = {
        ...data,
        datumPocetka: new Date(data.datumPocetka),
        datumIsteka: new Date(data.datumIsteka),
        prijavaOd: new Date(data.prijavaOd),
        prijavaDo: new Date(data.prijavaDo),
        status: 'U_RADU',
        dailyRecords: data.dailyRecords.map(record => ({
          ...record,
          datum: new Date(record.datum)
        }))
      }
      
      let response
      if (claimId) {
        // Update existing claim
        response = await fetch(`/api/claims/${claimId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })
      } else {
        // Create new claim
        response = await fetch('/api/claims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        })
      }

      const result = await response.json()
      
      if (response.ok) {
        // Save the claim ID for future updates
        if (!claimId && result.id) {
          if (type === 'lb') {
            setLbClaimId(result.id)
          } else {
            setLslClaimId(result.id)
          }
        }
        setShowSaveDialog(true)
      } else {
        if (result.details && Array.isArray(result.details)) {
          alert('Greške pri validaciji:\n' + result.details.join('\n'))
        } else {
          alert(result.error || 'Greška pri čuvanju prijave')
        }
      }
    } catch (error) {
      console.error('Error saving claim:', error)
      alert('Greška pri čuvanju prijave. Molimo pokušajte ponovo.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = (type: 'lb' | 'lsl') => {
    setResetTarget(type)
    setShowResetDialog(true)
  }

  const confirmReset = () => {
    if (resetTarget === 'lb') {
      setLbData(initialClaimData)
      setLbClaimId(null)
      setLbStatus('U_RADU')
      setTabNames(prev => ({ ...prev, lb: 'Lohmann Brown' }))
    } else if (resetTarget === 'lsl') {
      setLslData(initialLslData)
      setLslClaimId(null)
      setLslStatus('U_RADU')
      setTabNames(prev => ({ ...prev, lsl: 'Lohmann Brown LSL' }))
    }
    setShowResetDialog(false)
    setResetTarget(null)
  }

  const exportToExcel = async (type: 'lb' | 'lsl' | 'all') => {
    setIsLoading(true)
    try {
      // Prepare data to send
      let dataToExport
      if (type === 'all') {
        dataToExport = {
          type: 'all',
          claims: [lbData, lslData]
        }
      } else if (type === 'lb') {
        dataToExport = {
          type: 'single',
          claims: [lbData]
        }
      } else {
        dataToExport = {
          type: 'single',
          claims: [lslData]
        }
      }

      const response = await fetch('/api/claims/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToExport),
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
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEmailDialog = () => {
    setShowEmailDialog(true)
  }

  const sendEmailNotification = async () => {
    // First, save the selected claims if they have claim IDs
    const claimsToSubmit: Array<{ type: 'lb' | 'lsl', id: string }> = []
    
    if (emailSelection.lb && lbClaimId) {
      claimsToSubmit.push({ type: 'lb', id: lbClaimId })
    }
    if (emailSelection.lsl && lslClaimId) {
      claimsToSubmit.push({ type: 'lsl', id: lslClaimId })
    }
    
    // If any selected tab doesn't have a claim ID, alert user to save first
    if ((emailSelection.lb && !lbClaimId) || (emailSelection.lsl && !lslClaimId)) {
      alert('Molimo sačuvajte prijavu pre slanja email notifikacije.')
      setShowEmailDialog(false)
      return
    }
    
    // Update status to PODNETA for selected claims
    try {
      for (const claim of claimsToSubmit) {
        await fetch(`/api/claims/${claim.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'PODNETA' }),
        })
        
        // Update local status
        if (claim.type === 'lb') {
          setLbStatus('PODNETA')
        } else {
          setLslStatus('PODNETA')
        }
      }
    } catch (error) {
      console.error('Error updating claim status:', error)
      alert('Greška pri ažuriranju statusa prijave.')
      return
    }
    
    // Use data from the first selected tab for subject line
    const primaryData = emailSelection.lb ? lbData : lslData
    
    // Format current date and time
    const now = new Date()
    const formattedDateTime = `${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}. ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    // Email subject
    const subject = `Prijava štete na živini - ${primaryData.osiguranik} - Polisa #${primaryData.brojPolise}`

    // Build included tabs list
    const includedTabs: string[] = []
    if (emailSelection.lb) includedTabs.push(`Tab1 (${tabNames.lb})`)
    if (emailSelection.lsl) includedTabs.push(`Tab2 (${tabNames.lsl})`)

    // Email body
    const body = `Prijava štete na živini

${primaryData.osiguranik}
Polisa: #${primaryData.brojPolise}

Obuhvaćene prijave:
${includedTabs.join('\n')}

Datum: ${formattedDateTime}`

    // Create mailto link
    const mailtoLink = `mailto:stete@risk.co.rs?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open default email client
    window.location.href = mailtoLink
    
    // Close dialog
    setShowEmailDialog(false)
    
    // Show success message
    alert('✅ Status prijave promenjen u "Podneta". Email klijent je otvoren.')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">🐔 Prijava štete na živini</h1>
            <div className="flex gap-2">
              <Button variant="secondary" asChild>
                <a href="/admin/upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Učitaj polise
                </a>
              </Button>
              <Button variant="secondary" asChild>
                <a href="/claims" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Pregled prijava
                </a>
              </Button>
            </div>
          </div>
          
          {/* Policy Search */}
          <Card className="bg-primary-foreground text-foreground">
            <CardContent className="pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Unesite broj polise..."
                      value={policySearch}
                      onChange={(e) => {
                        setPolicySearch(e.target.value)
                        setSearchError('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          searchByPolicy()
                        }
                      }}
                      className="h-10"
                    />
                  </div>
                  <Button 
                    onClick={searchByPolicy} 
                    disabled={isLoading}
                    className="h-10"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pretraži
                  </Button>
                </div>
                {searchError && (
                  <p className="text-sm text-red-600">{searchError}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Pretražite prijave po broju polise da biste brzo prešli na drugu polisu
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-primary-foreground/80 mt-4">
            {lbData.osiguranik} - Polisa #{lbData.brojPolise}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lb">{tabNames.lb}</TabsTrigger>
            <TabsTrigger value="lsl">{tabNames.lsl}</TabsTrigger>
            <TabsTrigger value="export">📊 Export</TabsTrigger>
          </TabsList>

          <TabsContent value="lb" className="mt-6">
            <ClaimForm 
              data={lbData} 
              setData={setLbData} 
              type="lb"
              isLoading={isLoading}
              status={lbStatus}
              claimId={lbClaimId}
              saveClaim={saveClaim}
              resetForm={resetForm}
              exportToExcel={exportToExcel}
              openEmailDialog={openEmailDialog}
              addDailyRecord={addDailyRecord}
              removeDailyRecord={removeDailyRecord}
              updateDailyRecord={updateDailyRecord}
              calculateSummary={calculateSummary}
            />
          </TabsContent>

          <TabsContent value="lsl" className="mt-6">
            <ClaimForm 
              data={lslData} 
              setData={setLslData} 
              type="lsl"
              isLoading={isLoading}
              status={lslStatus}
              claimId={lslClaimId}
              saveClaim={saveClaim}
              resetForm={resetForm}
              exportToExcel={exportToExcel}
              openEmailDialog={openEmailDialog}
              addDailyRecord={addDailyRecord}
              removeDailyRecord={removeDailyRecord}
              updateDailyRecord={updateDailyRecord}
              calculateSummary={calculateSummary}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Opcije izvoza u Excel
                </CardTitle>
                <CardDescription>
                  Izaberite šta želite da izvezete u Excel format (.xlsx)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => exportToExcel('lb')} disabled={isLoading} className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Izvoz prijave Tab1
                  </Button>
                  <Button onClick={() => exportToExcel('lsl')} disabled={isLoading} className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Izvoz prijave Tab2
                  </Button>
                </div>
                <Separator />
                <Button onClick={() => exportToExcel('all')} disabled={isLoading} variant="outline" className="w-full h-16">
                  <Download className="h-6 w-6 mr-2" />
                  Izvoz OBE prijave
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Save Success Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Prijava sačuvana!</DialogTitle>
            <DialogDescription>
              Vaša prijava štete je uspešno sačuvana u sistem.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🔄 Resetovanje forme</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da resetujete formu? Svi uneti podaci će biti izgubljeni.
              <br /><br />
              <strong>Napomena:</strong> Resetovanje omogućava kreiranje nove prijave za novi mesečni period iste polise.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>Resetuj</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Selection Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✉️ Pošalji email notifikaciju</DialogTitle>
            <DialogDescription>
              Izaberite koje tab-ove želite da uključite u email notifikaciju.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tab-lb" 
                checked={emailSelection.lb}
                onCheckedChange={(checked) => setEmailSelection(prev => ({ ...prev, lb: checked as boolean }))}
              />
              <Label htmlFor="tab-lb" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tab1 ({tabNames.lb})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tab-lsl" 
                checked={emailSelection.lsl}
                onCheckedChange={(checked) => setEmailSelection(prev => ({ ...prev, lsl: checked as boolean }))}
              />
              <Label htmlFor="tab-lsl" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tab2 ({tabNames.lsl})
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Otkaži
            </Button>
            <Button 
              onClick={sendEmailNotification}
              disabled={!emailSelection.lb && !emailSelection.lsl}
            >
              <Mail className="h-4 w-4 mr-2" />
              Pošalji
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}