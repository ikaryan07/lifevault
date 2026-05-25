const BLOB_PREFIX = "homepin:docblob:";
const MAX_BYTES = 5 * 1024 * 1024;

function blobKey(documentId: string) {
  return `${BLOB_PREFIX}${documentId}`;
}

export async function saveDocumentBlob(documentId: string, file: File): Promise<void> {
  if (file.size > MAX_BYTES) {
    throw new Error("Files must be under 5 MB");
  }
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 = btoa(binary);
  localStorage.setItem(
    blobKey(documentId),
    JSON.stringify({ base64, mimeType: file.type || "application/octet-stream" })
  );
}

export function loadDocumentBlob(documentId: string): { blob: Blob; mimeType: string } | null {
  const raw = localStorage.getItem(blobKey(documentId));
  if (!raw) return null;
  try {
    const { base64, mimeType } = JSON.parse(raw) as { base64: string; mimeType: string };
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { blob: new Blob([bytes], { type: mimeType }), mimeType };
  } catch {
    return null;
  }
}

export function deleteDocumentBlob(documentId: string): void {
  localStorage.removeItem(blobKey(documentId));
}

export function hasDocumentBlob(documentId: string): boolean {
  return localStorage.getItem(blobKey(documentId)) !== null;
}
