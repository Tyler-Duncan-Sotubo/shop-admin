export async function toWebP(file: File, quality = 0.82): Promise<File> {
  // Skip if already WebP
  if (file.type === "image/webp") return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("WebP conversion failed"));
        const name = file.name.replace(/\.[^.]+$/, ".webp");
        resolve(new File([blob], name, { type: "image/webp" }));
      },
      "image/webp",
      quality,
    );
  });
}
