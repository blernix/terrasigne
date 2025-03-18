// app/api/emails/send.js

import { NextResponse } from 'next/server';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/subscriber';

export const config = {
  runtime: 'nodejs', // Assurez-vous d'utiliser le runtime Node.js
  api: {
    bodyParser: false, // Si vous utilisez formidable ou un autre parseur
  },
};

export async function POST(request) {
  try {
    // Initialiser la connexion à la base de données
    await connectToDatabase();

    // Récupérer les abonnés de la base de données
    const subscribers = await Subscriber.find({});

    if (!subscribers.length) {
      return NextResponse.json(
        { success: false, error: 'Aucun abonné trouvé' },
        { status: 400 }
      );
    }

    // Configurer le client Brevo
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY; // Assurez-vous d'ajouter cette variable dans .env.local

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Créer la liste des destinataires
    const to = subscribers.map((subscriber) => ({
      email: subscriber.email,
      name: subscriber.name || '',
    }));

    // Définir le contenu de l'email
    const sendSmtpEmail = {
      sender: { email: 'votre-email@domaine.com', name: 'Votre Nom' }, // Remplacez par votre email
      to: to,
      subject: 'Votre Sujet d\'Email',
      htmlContent: '<html><body><h1>Bonjour!</h1><p>Ceci est un email en masse envoyé via Brevo.</p></body></html>',
      // Vous pouvez également ajouter un texte brut
      // textContent: 'Bonjour! Ceci est un email en masse envoyé via Brevo.',
    };

    // Envoyer l'email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('Email envoyé avec succès:', response);

    return NextResponse.json(
      { success: true, message: 'Emails envoyés avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails:', error);

    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi des emails' },
      { status: 500 }
    );
  }
}