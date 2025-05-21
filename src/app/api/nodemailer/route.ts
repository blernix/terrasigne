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
    const { name, email, service, message } = body;

    if (!name || !email || !service || !message) {
      return NextResponse.json({ message: "Champs obligatoires manquants." }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"Formulaire Terrasigne" <${process.env.SMTP_USER}>`,
      to: "killian.lecrut@gmail.com", // Adresse de test
      replyTo: email,
      subject: `Nouveau message de ${name} - Service : ${service}`,
      html: `
        <h2>📩 Nouveau message reçu via le formulaire de contact</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Service sélectionné :</strong> ${service}</p>
        <p><strong>Message :</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
          ${message}
        </blockquote>
        <p style="font-size: 12px; color: #777;">Vous pouvez répondre directement à cet email.</p>
      `,
    });

    return NextResponse.json({ message: "Email envoyé avec succès." }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur Nodemailer :", error);
    return NextResponse.json({ message: "Erreur lors de l'envoi de l'email." }, { status: 500 });
  }
}