import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimData, type } = body

    if (!claimData) {
      return NextResponse.json(
        { error: 'Nedostaju podaci o prijavi' },
        { status: 400 }
      )
    }

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Calculate summary
    const totalUginulo = claimData.dailyRecords.reduce(
      (sum: number, record: any) => sum + record.uginulo,
      0
    )
    const prosek = claimData.dailyRecords.length > 0
      ? (totalUginulo / claimData.dailyRecords.length).toFixed(1)
      : '0.0'
    const procenat = ((totalUginulo / claimData.brojUseljenih) * 100).toFixed(2)

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .section-title { font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; }
          .summary-item { display: inline-block; margin: 10px 20px 10px 0; }
          .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .summary-label { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐔 Prijava štete na živini</h1>
            <p>${claimData.osiguranik} - Polisa #${claimData.brojPolise}</p>
          </div>

          <div class="section">
            <div class="section-title">📋 Osnovni podaci</div>
            <table>
              <tr><th>Osiguranik</th><td>${claimData.osiguranik}</td></tr>
              <tr><th>Radna jedinica/farma</th><td>${claimData.radnaJedinica}</td></tr>
              <tr><th>Vrsta/Kategorija</th><td>${claimData.vrsta}</td></tr>
              <tr><th>Objekat</th><td>${claimData.objekat}</td></tr>
              <tr><th>BPG</th><td>${claimData.bpg}</td></tr>
              <tr><th>HID</th><td>${claimData.hid}</td></tr>
              <tr><th>Broj polise</th><td>${claimData.brojPolise}</td></tr>
              <tr><th>Datum početka osiguranja</th><td>${claimData.datumPocetka}</td></tr>
              <tr><th>Datum isteka osiguranja</th><td>${claimData.datumIsteka}</td></tr>
              <tr><th>Broj useljenih</th><td>${claimData.brojUseljenih}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">💔 Podaci o šteti</div>
            <table>
              <tr><th>Vrsta štete</th><td>${claimData.vrstaStete}</td></tr>
              <tr><th>Uzrok štete</th><td>${claimData.uzrokStete}</td></tr>
              <tr><th>Veterinar</th><td>${claimData.veterinar}</td></tr>
              <tr><th>Broj licence</th><td>${claimData.brojLicence}</td></tr>
              <tr><th>Prijava štete od</th><td>${claimData.prijavaOd}</td></tr>
              <tr><th>Prijava štete do</th><td>${claimData.prijavaDo}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">📊 Dnevni zapisnici štete</div>
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Brojno stanje</th>
                  <th>Uginulo</th>
                  <th>Dijagnoza</th>
                  <th>Terapija</th>
                </tr>
              </thead>
              <tbody>
                ${claimData.dailyRecords.map((record: any) => `
                  <tr>
                    <td>${record.datum}</td>
                    <td>${record.brojnoStanje}</td>
                    <td>${record.uginulo}</td>
                    <td>${record.dijagnoza}</td>
                    <td>${record.terapija}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="summary">
            <div class="section-title">📈 Rezime štete</div>
            <div class="summary-item">
              <div class="summary-value">${totalUginulo}</div>
              <div class="summary-label">Total uginulih</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${prosek}</div>
              <div class="summary-label">Prosečno dnevno</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${procenat}%</div>
              <div class="summary-label">Procenat od useljenih</div>
            </div>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Ova prijava je automatski generisana iz sistema prijave štete na živini.
          </p>
        </div>
      </body>
      </html>
    `

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFICATION_EMAIL || 'stete@risk.co.rs',
      subject: `Prijava štete - ${claimData.osiguranik} - ${claimData.vrsta} ${claimData.objekat}`,
      html: emailHtml,
    })

    console.log('Email sent:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email uspešno poslat',
      messageId: info.messageId,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Greška pri slanju email-a. Molimo pokušajte ponovo.' },
      { status: 500 }
    )
  }
}
