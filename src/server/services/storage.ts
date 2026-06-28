// Abstração de storage. Default: Cloudflare R2 (S3-compatible, sem egress).
// Mantemos S3 API para portabilidade. Em dev, pode apontar para Supabase Storage.

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET ?? "decalq";

export async function putObject(key: string, body: Buffer, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

/** URL temporária para o provedor de IA ler a imagem de origem, ou para download. */
export async function signedUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn,
  });
}

export function buildKey(tenantId: string, kind: "source" | "result", id: string, ext: string) {
  return `${tenantId}/${kind}/${id}.${ext}`;
}
