import { NextResponse } from "next/server";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message, consent } = body;

    if (!name || !email || !service || !message || !consent) {
      return NextResponse.json(
        { message: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    const brandColor = "#6a2c70";

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:20px 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
              <tr>
                <td align="center" style="background-color:${brandColor};padding:30px 20px;color:#ffffff;">
                  <h1 style="margin:0;font-size:24px;">Nouveau message de TerraSigne ✨</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 30px;">
                  <p style="margin:0 0 20px;font-size:16px;color:#333333;">Bonjour,</p>
                  <p style="margin:0 0 20px;font-size:16px;color:#333333;">Vous avez reçu un nouveau message de <strong>${name}</strong> via le formulaire de votre site.</p>
                  <hr style="border:0;border-top:1px solid #eeeeee;margin:20px 0;">
                  <h3 style="color:${brandColor};margin-top:0;">Détails du contact :</h3>
                  <p style="margin:5px 0;font-size:16px;color:#333333;"><strong>Nom :</strong> ${name}</p>
                  <p style="margin:5px 0;font-size:16px;color:#333333;"><strong>Email :</strong> <a href="mailto:${email}" style="color:${brandColor};text-decoration:none;">${email}</a></p>
                  ${phone ? `<p style="margin:5px 0;font-size:16px;color:#333333;"><strong>Téléphone :</strong> ${phone}</p>` : ""}
                  <h3 style="color:${brandColor};margin-top:30px;">Sujet de la demande :</h3>
                  <p style="margin:5px 0;font-size:16px;color:#333333;"><strong>Service :</strong> ${service}</p>
                  <h3 style="color:${brandColor};margin-top:30px;">Message :</h3>
                  <div style="background-color:#f9f9f9;padding:15px;border-radius:5px;font-size:16px;color:#555555;line-height:1.5;">
                    ${message.replace(/\n/g, "<br>")}
                  </div>
                  <p style="margin:20px 0 0;font-size:13px;color:#888888;">Consentement RGPD : Oui</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await sendBrevoEmail({
      to: [{ email: process.env.CONTACT_RECIPIENT_EMAIL || "terrasigne971@gmail.com" }],
      replyTo: email,
      subject: `Nouveau message de ${name} - Service : ${service}`,
      htmlContent: emailHtml,
    });

    return NextResponse.json({ message: "Email envoyé avec succès." }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur envoi email contact :", error);
    return NextResponse.json(
      { message: "Erreur lors de l'envoi de l'email." },
      { status: 500 }
    );
  }
}
