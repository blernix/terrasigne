// utils/googleCloud.js
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
});

const bucketName = process.env.GCLOUD_BUCKET_NAME; // "mon-bucket"

// Fonction pour uploader un Buffer ou un stream
export async function uploadFileToGCS(fileBuffer, filename, mimeType) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  await file.save(fileBuffer, {
    metadata: { contentType: mimeType },
  });

  // Rendre le fichier public si vous voulez un accès direct via URL
  await file.makePublic();
  
  // URL publique
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}