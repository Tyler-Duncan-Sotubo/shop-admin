export type PresignedUpload = {
  key: string;
  uploadUrl: string;
  url: string; // public url
};

export async function uploadToS3Put(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  if (!res.ok) {
    throw new Error(`S3 upload failed (${res.status})`);
  }
}

export function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120);
}
