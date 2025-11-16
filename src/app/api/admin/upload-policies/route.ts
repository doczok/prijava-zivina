import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })

    if (data.length === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    let successCount = 0
    const errors: string[] = []

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i]
      const rowNum = i + 2 // +2 because Excel rows are 1-indexed and we skip header

      try {
        // Validate required fields
        const requiredFields = [
          'Broj polise',
          'Osiguranik',
          'Radna jedinica',
          'Vrsta',
          'Objekat',
          'BPG',
          'HID',
          'Datum početka',
          'Datum isteka',
          'Broj useljenih',
          'Datum useljenja'
        ]

        const missingFields = requiredFields.filter(field => !row[field])
        if (missingFields.length > 0) {
          errors.push(`Red ${rowNum}: Nedostaju polja: ${missingFields.join(', ')}`)
          continue
        }

        // Parse dates
        const parseDat = (dateStr: string) => {
          // Try parsing YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return new Date(dateStr)
          }
          // Try parsing DD/MM/YYYY or DD.MM.YYYY
          const parts = dateStr.split(/[\/\.]/)
          if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
          }
          return new Date(dateStr)
        }

        const datumPocetka = parseDat(row['Datum početka'])
        const datumIsteka = parseDat(row['Datum isteka'])
        const datumUseljenja = parseDat(row['Datum useljenja'])

        if (isNaN(datumPocetka.getTime()) || isNaN(datumIsteka.getTime()) || isNaN(datumUseljenja.getTime())) {
          errors.push(`Red ${rowNum}: Nevažeći format datuma`)
          continue
        }

        // Parse number
        const brojUseljenih = parseInt(row['Broj useljenih'])
        if (isNaN(brojUseljenih)) {
          errors.push(`Red ${rowNum}: Nevažeći broj useljenih`)
          continue
        }

        // Create claim with default values for other fields
        await db.claim.create({
          data: {
            brojPolise: row['Broj polise'].toString(),
            osiguranik: row['Osiguranik'],
            radnaJedinica: row['Radna jedinica'],
            vrsta: row['Vrsta'],
            kategorija: 'Kokoši', // Default value
            objekat: row['Objekat'],
            bpg: row['BPG'].toString(),
            hid: row['HID'].toString(),
            datumPocetka,
            datumIsteka,
            brojUseljenih,
            datumUseljenja,
            vrstaStete: 'Uginuće', // Default value
            uzrokStete: 'Bolest', // Default value
            veterinar: '', // Empty, to be filled later
            brojLicence: '', // Empty, to be filled later
            prijavaOd: datumPocetka, // Default to start date
            prijavaDo: new Date(datumPocetka.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days
          }
        })

        successCount++
      } catch (error: any) {
        console.error(`Error processing row ${rowNum}:`, error)
        errors.push(`Red ${rowNum}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: successCount,
      errors
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
