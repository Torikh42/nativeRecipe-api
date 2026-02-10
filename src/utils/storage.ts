import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// 1. Inisialisasi S3 Client (R2)
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// 2. Fungsi Sanitize Nama File
export const sanitizeFilename = (originalName: string): string => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  
  // Ubah ke lowercase, ganti spasi dengan -, hapus karakter non-alphanumeric (kecuali -)
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-"); // Hapus dash berurutan

  return `${sanitized}${ext}`;
};

// 3. Konfigurasi Multer Upload
export const uploadStorage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.R2_BUCKET_NAME || "",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req: any, file: any, cb: any) {
      const cleanName = sanitizeFilename(file.originalname);
      const fileName = `recipes/${Date.now()}-${cleanName}`;
      cb(null, fileName);
    },
  }),
});

// 4. Fungsi Helper untuk mendapatkan Public URL
// R2 S3 Endpoint seringkali private. User harus set R2_PUBLIC_DOMAIN di .env
// Contoh: https://pub-xxxx.r2.dev atau https://cdn.mydomain.com
export const getPublicUrl = (file: any): string => {
  if (process.env.R2_PUBLIC_DOMAIN) {
    // Jika user punya custom domain / r2.dev subdomain
    // file.key adalah "recipes/filename.jpg"
    // Hasil: https://pub-xxxx.r2.dev/recipes/filename.jpg
    const domain = process.env.R2_PUBLIC_DOMAIN.replace(/\/$/, ""); // Hapus trailing slash
    return `${domain}/${file.key}`;
  }
  // Fallback ke lokasi default (mungkin tidak bisa dibuka jika bucket private)
  return file.location;
};

// 5. Fungsi Delete File
export const deleteFromStorage = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) return;

  try {
    // Ekstrak Key dari URL
    // URL bisa berupa:
    // A: https://ACCOUNT_ID.r2.cloudflarestorage.com/BUCKET/recipes/file.jpg
    // B: https://CUSTOM_DOMAIN/recipes/file.jpg
    
    let key = "";
    
    const urlObj = new URL(fileUrl);
    
    if (process.env.R2_PUBLIC_DOMAIN && fileUrl.startsWith(process.env.R2_PUBLIC_DOMAIN)) {
       // Kasus B: Langsung ambil pathname tanpa slash depan
       key = urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
    } else {
       // Kasus A (Default Endpoint): Path biasanya /BUCKET_NAME/folder/file
       // Kita perlu membuang bagian bucket name jika ada di path
       const pathParts = urlObj.pathname.split("/").filter(p => p); // remove empty
       
       // Asumsi struktur standar R2 direct link, folder/file ada di akhir
       // Jika bucket name ada di path, kita cari folder 'recipes'
       const recipeIndex = pathParts.indexOf("recipes");
       if (recipeIndex !== -1) {
         key = pathParts.slice(recipeIndex).join("/");
       } else {
         // Fallback kasar
         key = urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
       }
    }

    console.log(`Attempting to delete R2 Key: ${key}`);

    const deleteParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`Successfully deleted from R2: ${key}`);
  } catch (err) {
    console.error(`Failed to delete file from R2 (${fileUrl}):`, err);
    // Jangan throw error agar proses delete DB tetap lanjut
  }
};
