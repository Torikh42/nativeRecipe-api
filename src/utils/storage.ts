import {
	DeleteObjectCommand,
	HeadObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

const {
	R2_ACCOUNT_ID,
	R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY,
	R2_BUCKET_NAME,
	R2_PUBLIC_URL,
} = process.env;

// Validate .env
if (
	!R2_ACCOUNT_ID ||
	!R2_ACCESS_KEY_ID ||
	!R2_SECRET_ACCESS_KEY ||
	!R2_BUCKET_NAME ||
	!R2_PUBLIC_URL
) {
	console.warn("R2 storage configuration is incomplete in .env");
}

// Config R2 Client
export const r2Client = new S3Client({
	region: "auto",
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID || "",
		secretAccessKey: R2_SECRET_ACCESS_KEY || "",
	},
});

/**
 * Multer middleware for uploading to R2
 */
export const uploadStorage = multer({
	storage: multerS3({
		s3: r2Client,
		bucket: R2_BUCKET_NAME || "",
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: (req, file, cb) => {
			const folder = "recipes";
			const fileName = `${Date.now()}-${file.originalname.toLowerCase().replace(/\s+/g, "-")}`;
			cb(null, `${folder}/${fileName}`);
		},
	}),
});

/**
 * Get public URL from uploaded file object
 * @param file Multer file object
 */
export const getPublicUrl = (file: any): string => {
	if (!file) return "";
	
	// If multer-s3 is used, file.key contains the path in the bucket
	if (file.key) {
		return `${R2_PUBLIC_URL}/${file.key}`;
	}
	
	// Fallback to location if key is not present
	return file.location || "";
};

/**
 * Delete a file from R2 by its public URL
 * @param fullUrl The full public URL of the file
 */
export async function deleteFromStorage(fullUrl: string) {
	if (!fullUrl) {
		console.warn("No URL provided for deletion.");
		return false;
	}

	try {
		const url = new URL(fullUrl);
		// Pathname includes the leading slash, so we slice it
		// e.g. /recipes/123-image.jpg -> recipes/123-image.jpg
		const key = url.pathname.startsWith("/")
			? url.pathname.slice(1)
			: url.pathname;

		const params = {
			Bucket: R2_BUCKET_NAME,
			Key: key,
		};

		// Check if object exists first
		await r2Client.send(new HeadObjectCommand(params));

		// Delete object
		await r2Client.send(new DeleteObjectCommand(params));
		return true;
	} catch (err: any) {
		if (err.name === "NotFound") {
			console.warn(`File not found for deletion in R2: ${fullUrl}`);
			return false;
		}
		console.error("Failed to delete file from R2:", err);
		throw new Error("Failed to delete file from storage");
	}
}