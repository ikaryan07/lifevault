import { createClient } from "@/lib/supabase/client";
import { encryptFile, generateEncryptionKey, exportKey } from "@/lib/encryption";

export interface UploadResult {
  filePath: string;
  encryptionIv: string;
  encryptionKey: string;
}

export async function uploadEncryptedDocument(
  file: File,
  userId: string
): Promise<UploadResult> {
  const supabase = createClient();

  const key = await generateEncryptionKey();
  const { encryptedData, iv } = await encryptFile(file, key);
  const exportedKey = await exportKey(key);

  const fileName = `${userId}/${crypto.randomUUID()}.enc`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(fileName, encryptedData, {
      contentType: "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return {
    filePath: fileName,
    encryptionIv: iv,
    encryptionKey: exportedKey,
  };
}

export async function downloadDecryptedDocument(
  filePath: string,
  encryptionKey: string,
  encryptionIv: string
): Promise<Blob> {
  const supabase = createClient();
  const { importKey } = await import("@/lib/encryption");
  const { decryptFile } = await import("@/lib/encryption");

  const { data, error } = await supabase.storage
    .from("documents")
    .download(filePath);

  if (error || !data) {
    throw new Error(`Download failed: ${error?.message}`);
  }

  const key = await importKey(encryptionKey);
  const encryptedBuffer = await data.arrayBuffer();
  const decryptedBuffer = await decryptFile(encryptedBuffer, key, encryptionIv);

  return new Blob([decryptedBuffer]);
}

export async function deleteDocument(filePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from("documents")
    .remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  title: string;
  category: string;
  file_name: string;
  file_size: number;
  file_path: string;
  encryption_iv: string;
  notes?: string;
  uploaded_at: string;
  updated_at: string;
}

export async function saveDocumentRecord(record: Omit<DocumentRecord, "id" | "uploaded_at" | "updated_at">): Promise<DocumentRecord> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("documents")
    .insert(record)
    .select()
    .single();

  if (error) {
    throw new Error(`Save failed: ${error.message}`);
  }

  return data;
}

export async function fetchDocuments(userId: string): Promise<DocumentRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }

  return data || [];
}

export async function removeDocumentRecord(documentId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    throw new Error(`Delete record failed: ${error.message}`);
  }
}
