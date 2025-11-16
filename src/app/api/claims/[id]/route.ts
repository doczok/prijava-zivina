import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Check if claim exists
    const existingClaim = await db.claim.findUnique({
      where: { id },
      include: { dailyRecords: true }
    })
    
    if (!existingClaim) {
      return NextResponse.json(
        { error: 'Prijava nije pronađena' },
        { status: 404 }
      )
    }
    
    // Don't allow editing if status is PODNETA or later
    if (existingClaim.status === 'PODNETA' || existingClaim.status === 'U_OBRADI' || existingClaim.status === 'ODOBRENA') {
      return NextResponse.json(
        { error: 'Ne možete menjati prijavu koja je već podneta' },
        { status: 403 }
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
    
    // Delete existing daily records
    await db.dailyRecord.deleteMany({
      where: { claimId: id }
    })
    
    // Update the claim with new data
    const updatedClaim = await db.claim.update({
      where: { id },
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
      message: 'Prijava uspešno ažurirana',
      id: updatedClaim.id,
      claim: updatedClaim
    })
  } catch (error) {
    console.error('Error updating claim:', error)
    return NextResponse.json(
      { error: 'Greška pri ažuriranju prijave. Molimo pokušajte ponovo.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Only allow status updates via PATCH
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status je obavezan' },
        { status: 400 }
      )
    }
    
    const updatedClaim = await db.claim.update({
      where: { id },
      data: {
        status: body.status
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Status prijave uspešno ažuriran',
      claim: updatedClaim
    })
  } catch (error) {
    console.error('Error updating claim status:', error)
    return NextResponse.json(
      { error: 'Greška pri ažuriranju statusa prijave.' },
      { status: 500 }
    )
  }
}
