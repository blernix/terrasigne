import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message } = body;

    if (!name || !email || !service || !message) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 });
    }

    // --- Début du Template HTML de l'e-mail ---
    const brandColor = "#6a2c70"; // Couleur principale de la marque (à personnaliser)

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
              
              <tr>
                <td align="center" style="background-color: ${brandColor}; padding: 30px 20px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 24px;">Nouveau message de TerraSigne ✨</h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">Bonjour,</p>
                  <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">Vous avez reçu un nouveau message de <strong>${name}</strong> via le formulaire de votre site.</p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">

                  <h3 style="color: ${brandColor}; margin-top: 0;">Détails du contact :</h3>
                  <p style="margin: 5px 0; font-size: 16px; color: #333333;"><strong>Nom :</strong> ${name}</p>
                  <p style="margin: 5px 0; font-size: 16px; color: #333333;"><strong>Email :</strong> <a href="mailto:${email}" style="color: ${brandColor}; text-decoration: none;">${email}</a></p>
                  ${phone ? `<p style="margin: 5px 0; font-size: 16px; color: #333333;"><strong>Téléphone :</strong> ${phone}</p>` : ''}
                  
                  <h3 style="color: ${brandColor}; margin-top: 30px;">Sujet de la demande :</h3>
                  <p style="margin: 5px 0; font-size: 16px; color: #333333;"><strong>Service :</strong> ${service}</p>

                  <h3 style="color: ${brandColor}; margin-top: 30px;">Message :</h3>
                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; font-size: 16px; color: #555555; line-height: 1.5;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                </td>
              </tr>

              <tr>
                <td align="center" style="background-color: #eeeeee; padding: 20px 30px; color: #777777;">
                  <p style="margin: 0; font-size: 14px;">Vous pouvez répondre directement à cet e-mail pour contacter ${name}.</p>
                  <p style="margin: 10px 0 0; font-size: 12px;">Cet e-mail a été envoyé automatiquement depuis le site terrasigne.fr</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    // --- Fin du Template HTML ---

    await transporter.sendMail({
      from: `"Formulaire Terrasigne" <${process.env.SMTP_USER}>`,
      // to: "terrasigne971@gmail.com",
      to: "killian.lecrut@gmail.com",
      replyTo: email,
      subject: `Nouveau message de ${name} - Service : ${service}`,
      html: emailHtml,
    });

    return NextResponse.json({ message: "Email envoyé avec succès." }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur Nodemailer :", error);
    return NextResponse.json({ message: "Erreur lors de l'envoi de l'email." }, { status: 500 });
  }
}