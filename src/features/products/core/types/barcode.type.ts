export type BarcodeFormat = "code128" | "ean13" | "qrcode";

export type GenerateBarcodeResult = {
  variantId: string;
  barcode: string;
  barcodeImageUrl: string;
  storageKey: string;
};
