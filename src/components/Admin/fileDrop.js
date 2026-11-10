export function getFirstDroppedFile(e) {
  const items = e?.dataTransfer?.items;
  if (items?.length) {
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) return file;
      }
    }
  }
  return e?.dataTransfer?.files?.[0] || null;
}

export function getDroppedFileCount(e) {
  const items = e?.dataTransfer?.items;
  if (items?.length) {
    const fileCount = Array.from(items).filter((item) => item.kind === "file")
      .length;
    if (fileCount > 0) return fileCount;
  }
  return e?.dataTransfer?.files?.length || 0;
}

export function isPdf(file) {
  if (!file) return false;
  if (file.type === "application/pdf") return true;
  return typeof file.name === "string" && file.name.toLowerCase().endsWith(".pdf");
}

export function isImage(file) {
  return !!file?.type?.startsWith("image/");
}

export function validatePdf(file, maxBytes = 10 * 1024 * 1024) {
  if (!isPdf(file)) return "Please select a valid PDF";
  if (file.size > maxBytes) return "PDF must be under 10MB";
  return null;
}

export function validateImage(file, maxBytes = 5 * 1024 * 1024) {
  if (!isImage(file)) return "Please select a valid image file";
  if (file.size > maxBytes) return "Image must be under 5MB";
  return null;
}
