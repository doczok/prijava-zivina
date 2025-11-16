import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Validation schema
function validateClaimData(body: any) {
  const errors: string[] = []

  // Required fields validation
  const requiredFields = [
    'osiguranik', 'radnaJedinica', 'vrsta', 'objekat', 'brojPolise',
    'brojUseljenih', 'vrstaStete', 'uzrokStete', 'veterinar', 'brojLicence',
    'prijavaOd', 'prijavaDo'
  ]

  requiredFields.forEach(field => {
    if (!body[field] || body[field] === '') {
      errors.push(`${field} je obavezno polje`)
    }
  })

  // Numeric validation
  if (body.brojUseljenih && (isNaN(body.brojUseljenih) || body.brojUseljenih <= 0)) {
    errors.push('Broj useljenih mora biti pozitivan broj')
  }

  // Date validation
  if (body.prijavaOd && body.prijavaDo) {
    const odDate = new Date(body.prijavaOd)
    const doDate = new Date(body.prijavaDo)
    if (odDate > doDate) {
      errors.push('Datum početka prijave ne može biti posle datuma završetka')
    }
  }

  // Daily records validation
  if (body.dailyRecords && Array.isArray(body.dailyRecords)) {
    body.dailyRecords.forEach((record: any, index: number) => {
      if (!record.datum) {
        errors.push(`Datum za zapis ${index + 1} je obavezan`)
      }
      if (isNaN(record.brojnoStanje) || record.brojnoStanje < 0) {
        errors.push(`Brojno stanje za zapis ${index + 1} mora biti nenegativan broj`)
      }
      if (isNaN(record.uginulo) || record.uginulo < 0) {
        errors.push(`Broj uginulih za zapis ${index + 1} mora biti nenegativan broj`)
      }
    })
  } else {
    errors.push('Morate imati barem jedan dnevni zapisnik')
  }

  return errors
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationErrors = validateClaimData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    const {
      osiguranik,
      radnaJedinica,
      vrsta,
      kategorija,
      objekat,
      bpg,
      hid,
      brojPolise,
      datumPocetka,
      datumIsteka,
      brojUseljenih,
      vrstaStete,
      uzrokStete,
      veterinar,
      brojLicence,
      prijavaOd,
      prijavaDo,
      dailyRecords
    } = body

    // Create the claim
    const claim = await db.claim.create({
      data: {
        osiguranik,
        radnaJedinica,
        vrsta,
        kategorija: kategorija || 'Kokoši',
        objekat,
        bpg,
        hid,
        brojPolise,
        datumPocetka: new Date(datumPocetka),
        datumIsteka: new Date(datumIsteka),
        brojUseljenih: parseInt(brojUseljenih),
        vrstaStete,
        uzrokStete,
        veterinar,
        brojLicence,
        prijavaOd: new Date(prijavaOd),
        prijavaDo: new Date(prijavaDo),
        status: body.status || 'U_RADU',
        dailyRecords: {
          create: dailyRecords.map((record: any) => ({
            datum: new Date(record.datum),
            brojnoStanje: parseInt(record.brojnoStanje),
            uginulo: parseInt(record.uginulo),
            dijagnoza: record.dijagnoza || '',
            terapija: record.terapija || ''
          }))
        }
      },
      include: {
        dailyRecords: {
          orderBy: {
            datum: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Prijava uspešno sačuvana',
      id: claim.id,
      claim 
    })
  } catch (error) {
    console.error('Error creating claim:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Prijava sa ovim podacima već postoji' },
          { status: 409 }
        )
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Neispravni podaci - proverite vezane entitete' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Greška pri čuvanju prijave. Molimo pokušajte ponovo.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const whereClause = status ? { status } : {}
    
    const claims = await db.claim.findMany({
      where: whereClause,
      include: {
        dailyRecords: {
          orderBy: {
            datum: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(claims)
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json(
      { error: 'Greška pri učitavanju prijava. Molimo pokušajte ponovo.' },
      { status: 500 }
    )
  }
}