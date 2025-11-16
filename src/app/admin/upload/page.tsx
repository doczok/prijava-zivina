'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      if (extension === 'csv' || extension === 'xlsx') {
        setFile(selectedFile)
        setError('')
        setResult(null)
      } else {
        setError('Molimo izaberite CSV ili XLSX fajl')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Molimo izaberite fajl')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload-policies', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri učitavanju')
      }

      setResult(data)
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      setError(err.message || 'Greška pri učitavanju fajla')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="secondary" asChild>
              <a href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Nazad
              </a>
            </Button>
            <h1 className="text-3xl font-bold">📤 Masovno učitavanje polisa</h1>
          </div>
          <p className="text-primary-foreground/80">
            Administratorska stranica za učitavanje polisa iz CSV ili Excel fajla
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Učitavanje fajla sa polisama
            </CardTitle>
            <CardDescription>
              Podržani formati: CSV (.csv) i Excel (.xlsx)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Izaberite fajl</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Izabran: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Expected Format */}
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-sm">Očekivani format fajla</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">CSV ili Excel fajl mora imati sledeće kolone (zaglavlje):</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li><strong>Broj polise</strong> - Broj polise osiguranja</li>
                  <li><strong>Osiguranik</strong> - Ime osiguranika</li>
                  <li><strong>Radna jedinica</strong> - Radna jedinica/farma</li>
                  <li><strong>Vrsta</strong> - Vrsta/Kategorija (npr. "Lohmann Brown")</li>
                  <li><strong>Objekat</strong> - Objekat (npr. "FĆ 1")</li>
                  <li><strong>BPG</strong> - BPG broj (deli se između objekata)</li>
                  <li><strong>HID</strong> - HID broj (različit za svaki objekat)</li>
                  <li><strong>Datum početka</strong> - Datum početka osiguranja (YYYY-MM-DD, deli se)</li>
                  <li><strong>Datum isteka</strong> - Datum isteka osiguranja (YYYY-MM-DD, deli se)</li>
                  <li><strong>Broj useljenih</strong> - Broj useljenih životinja (različit za svaki objekat)</li>
                  <li><strong>Datum useljenja</strong> - Datum useljenja (YYYY-MM-DD, različit za svaki objekat)</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    <strong>Napomena o polisama sa dva objekta:</strong>
                  </p>
                  <p className="text-sm text-blue-800 mb-1">
                    <strong>Deljeni podaci</strong> (isti u oba reda): Broj polise, Osiguranik, BPG, Datum početka, Datum isteka
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Različiti podaci</strong> (specifični za objekat): Radna jedinica/farma, Vrsta/kategorija, Objekat, HID, Broj useljenih, Datum useljenja
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Button */}
            <Button 
              onClick={handleUpload} 
              disabled={!file || isLoading}
              className="w-full"
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isLoading ? 'Učitavanje...' : 'Učitaj polise'}
            </Button>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Result */}
            {result && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-medium text-green-900">
                    ✅ Uspešno učitano {result.success} polisa!
                  </p>
                  {result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-orange-900">Greške:</p>
                      <ul className="text-sm text-orange-800 list-disc list-inside">
                        {result.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Sample CSV */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Primer CSV fajla</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
{`Broj polise,Osiguranik,Radna jedinica,Vrsta,Objekat,BPG,HID,Datum početka,Datum isteka,Broj useljenih,Datum useljenja
806411,Spasić Farm doo Stalać,Ćićevac Lovačko Polje,Lohmann Brown,FĆ 1,744247000750,744328008498,2025-01-01,2025-12-31,19499,2025-01-01
806411,Spasić Farm doo Stalać,Kruševac Objekat 2,Lohmann Brown LSL,FĆ 2,744247000750,744328008499,2025-01-01,2025-12-31,4123,2025-01-05
806412,Petrović Farm,Kruševac Glavna farma,Lohmann Brown,Objekat A,744247000760,744328008500,2025-02-01,2025-08-01,15000,2025-02-01`}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Napomena: Polisa 806411 ima 2 objekta (FĆ 1 i FĆ 2) koji dele isti Broj polise, Osiguranik, BPG i datume polise, 
              ali imaju različite Radne jedinice, Vrste, HID brojeve, Broj useljenih i Datum useljenja.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
