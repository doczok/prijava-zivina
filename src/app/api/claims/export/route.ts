import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { type, claims } = await request.json()
    
    if (!claims || claims.length === 0) {
      return NextResponse.json(
        { error: 'No claims data provided' },
        { status: 400 }
      )
    }

    // Create workbook
    const wb = XLSX.utils.book_new()

    claims.forEach((claim: any, index: number) => {
      // Format dates as strings for display
      const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('sr-RS')
      }

      // Create claim data
      const claimData = [
        ['PRIJAVA ŠTETE NA ŽIVINI'],
        [''],
        ['Osiguranik:', claim.osiguranik, '', 'Polisa:', claim.brojPolise],
        ['Radna jedinica:', claim.radnaJedinica, '', 'Datum:', new Date().toLocaleDateString('sr-RS')],
        ['Vrsta:', `${claim.vrsta} ${claim.objekat}`, '', 'Useljeno:', `${claim.brojUseljenih} kom`],
        [''],
        ['Vrsta štete:', claim.vrstaStete, '', 'Uzrok:', claim.uzrokStete],
        ['Veterinar:', claim.veterinar, '', 'Licenca:', claim.brojLicence],
        ['Period od:', formatDate(claim.prijavaOd), '', 'do:', formatDate(claim.prijavaDo)],
        [''],
        ['DNEVNI ZAPISNIK ŠTETE'],
        ['RB', 'Datum', 'Brojno stanje', 'Uginulo', 'Dijagnoza', 'Terapija']
      ]

      // Add daily records
      claim.dailyRecords.forEach((record: any, recordIndex: number) => {
        claimData.push([
          recordIndex + 1,
          formatDate(record.datum),
          record.brojnoStanje,
          record.uginulo,
          record.dijagnoza,
          record.terapija || '-'
        ])
      })

      // Calculate summary
      const totalUginulo = claim.dailyRecords.reduce((sum: number, record: any) => sum + record.uginulo, 0)
      const prosek = claim.dailyRecords.length > 0 ? (totalUginulo / claim.dailyRecords.length).toFixed(1) : '0.0'
      const procenat = ((totalUginulo / claim.brojUseljenih) * 100).toFixed(2)

      claimData.push([
        '',
        '',
        '',
        '',
        '',
        ''
      ])
      claimData.push(['REZIME ŠTETE'])
      claimData.push(['Total uginulih:', totalUginulo, 'kom'])
      claimData.push(['Prosečno dnevno:', prosek, 'kom'])
      claimData.push(['Procenat od useljenih:', `${procenat}%`, ''])

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(claimData)
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // RB
        { wch: 15 }, // Datum
        { wch: 15 }, // Brojno stanje
        { wch: 10 }, // Uginulo
        { wch: 20 }, // Dijagnoza
        { wch: 20 }  // Terapija
      ]

      // Add worksheet to workbook
      const sheetName = type === 'all' 
        ? `Prijava_${index + 1}` 
        : claim.vrsta.includes('Tab2') ? 'Tab2' : 'Tab1'
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return as file
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="prijava-stete-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })

  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return NextResponse.json(
      { error: 'Failed to export to Excel' },
      { status: 500 }
    )
  }
}