"use client";

import { useState, useCallback } from "react";
import { useVault, StoredDocument } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  FolderLock,
  Plus,
  File,
  X,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/types";
import { PageTransition } from "@/components/motion/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SearchInput } from "@/components/ui/search-input";
import {
  saveDocumentBlob,
  loadDocumentBlob,
  deleteDocumentBlob,
} from "@/lib/document-blobs";
import { uploadEncryptedDocument, downloadDecryptedDocument } from "@/lib/services/documents";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function VaultPage() {
  const { documents, setDocuments, plan, isHydrated, cloudMode, upsertDocument, removeDocument } = useVault();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("other");
  const [uploadNotes, setUploadNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<StoredDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const atLimit = isFinite(plan.limits.documents) && documents.length >= plan.limits.documents;

  function tryOpenUpload() {
    if (atLimit) {
      toast.error(`${plan.name} plan limit reached`, {
        description: `Upgrade your plan to add more than ${plan.limits.documents} documents.`,
        action: { label: "Upgrade", onClick: () => window.location.assign("/dashboard/settings/plan") },
      });
      return;
    }
    setUploadOpen(true);
  }

  function resetUploadForm() {
    setSelectedFile(null);
    setUploadTitle("");
    setUploadCategory("other");
    setUploadNotes("");
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (atLimit) {
      toast.error("Plan limit reached — upgrade to add more documents.", {
        action: { label: "Upgrade", onClick: () => window.location.assign("/dashboard/settings/plan") },
      });
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
      setUploadOpen(true);
    }
  }, [uploadTitle, atLimit]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    const id = crypto.randomUUID();
    let newDoc: StoredDocument = {
      id,
      title: uploadTitle || selectedFile.name,
      category: uploadCategory,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.type,
      hasFile: true,
      notes: uploadNotes || undefined,
      uploadedAt: new Date().toISOString(),
    };

    try {
      if (cloudMode && isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        const uploaded = await uploadEncryptedDocument(selectedFile, user.id);
        newDoc = {
          ...newDoc,
          filePath: uploaded.filePath,
          encryptionIv: uploaded.encryptionIv,
          encryptionKey: uploaded.encryptionKey,
        };
        const result = await upsertDocument(newDoc, uploaded.encryptionKey);
        if (result.error) throw new Error(result.error);
        if (result.document) newDoc = result.document;
      } else {
        await saveDocumentBlob(id, selectedFile);
      }

      setDocuments((prev) => [newDoc, ...prev]);
      resetUploadForm();
      setUploadOpen(false);
      toast.success("Document saved", {
        description: cloudMode
          ? `"${newDoc.title}" is encrypted and backed up to your vault.`
          : `"${newDoc.title}" is stored securely on this device.`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save file");
    }
  }

  async function downloadDocument(doc: StoredDocument) {
    if (cloudMode && doc.filePath && doc.encryptionKey && doc.encryptionIv) {
      try {
        const blob = await downloadDecryptedDocument(doc.filePath, doc.encryptionKey, doc.encryptionIv);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.fileName;
        a.click();
        URL.revokeObjectURL(url);
        return;
      } catch {
        toast.error("Could not download from cloud — try again.");
        return;
      }
    }

    const stored = loadDocumentBlob(doc.id);
    if (!stored) {
      toast.error("File not found — it may have been saved on another device.");
      return;
    }
    const url = URL.createObjectURL(stored.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const doc = documents.find((d) => d.id === deleteId);

    if (cloudMode) {
      const result = await removeDocument(deleteId, doc?.filePath);
      if (result.error) {
        toast.error("Could not delete", { description: result.error });
        setDeleteId(null);
        return;
      }
    } else {
      deleteDocumentBlob(deleteId);
    }

    setDocuments((prev) => prev.filter((d) => d.id !== deleteId));
    setSelectedDoc(null);
    setDeleteId(null);
    toast.success("Document removed", {
      description: `"${doc?.title}" has been deleted from your vault.`,
    });
  }

  const docToDelete = deleteId
    ? documents.find((d) => d.id === deleteId)
    : null;

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (!isHydrated) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.entries(DOCUMENT_CATEGORIES);

  return (
    <PageTransition>
      <div
        className="space-y-6"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-16">
                <Upload className="h-12 w-12 text-primary" />
                <p className="text-xl font-semibold text-primary">
                  Drop your file here
                </p>
                <p className="text-muted-foreground">
                  It&apos;ll be stored safely in your vault
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Documents</h1>
            <p className="mt-1 text-muted-foreground">
              All your important papers, safely stored and organised.
            </p>
          </div>

          <Button size="lg" onClick={tryOpenUpload}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUploadForm(); }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Your document metadata will be saved securely. Only you and your
                  trusted contacts can access it.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {!selectedFile ? (
                  <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 p-10 transition-colors hover:border-primary/50 hover:bg-muted/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-medium">
                        Click to select a file
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or drag and drop it anywhere on this page
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.xls,.xlsx"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="docTitle">What is this document?</Label>
                  <Input
                    id="docTitle"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Last Will and Testament"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docCategory">Category</Label>
                  <select
                    id="docCategory"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {categories.map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docNotes">Notes (optional)</Label>
                  <Textarea
                    id="docNotes"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="Any notes about this document..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-sm text-primary">
                  <FolderLock className="h-4 w-4 shrink-0" />
                  Your document is stored securely with access controls.
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleUpload}
                  disabled={!selectedFile}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Save Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        {documents.length > 0 && (
          <>
            <SearchInput
              placeholder="Search your documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search documents"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({documents.length})
              </button>
              {categories
                .filter(([key]) => documents.some((d) => d.category === key))
                .map(([key, { label }]) => {
                  const count = documents.filter((d) => d.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key as DocumentCategory)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        activeCategory === key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
            </div>
          </>
        )}

        {/* Document Grid */}
        {filteredDocs.length === 0 && documents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                Ready to add your first document?
              </h3>
              <p className="mt-2 max-w-sm text-center text-base text-muted-foreground">
                You could start with your will, an insurance policy, a bank
                statement — anything important. It&apos;ll be safely stored.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Tip: You can drag and drop files anywhere on this page!
              </p>
              <Button className="mt-6" size="lg" onClick={tryOpenUpload}>
                <Upload className="mr-2 h-5 w-5" />
                Upload a document
              </Button>
            </CardContent>
          </Card>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-foreground">No documents found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or clear your category filter.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {DOCUMENT_CATEGORIES[doc.category].label}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3 text-base">{doc.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {doc.fileName} &middot; {formatFileSize(doc.fileSize)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FolderLock className="h-3 w-3" />
                        Secured &middot; Saved{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString("en-AU")}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Document Detail Dialog */}
        <Dialog
          open={!!selectedDoc}
          onOpenChange={(open) => !open && setSelectedDoc(null)}
        >
          <DialogContent>
            {selectedDoc && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedDoc.title}</DialogTitle>
                  <DialogDescription>
                    {DOCUMENT_CATEGORIES[selectedDoc.category].label}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="rounded-xl border bg-muted/50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">File</span>
                      <span className="font-medium">{selectedDoc.fileName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium">
                        {formatFileSize(selectedDoc.fileSize)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span className="font-medium">
                        {new Date(selectedDoc.uploadedAt).toLocaleDateString(
                          "en-AU",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Security</span>
                      <span className="flex items-center gap-1 font-medium text-green-600">
                        <FolderLock className="h-3.5 w-3.5" />
                        Secured
                      </span>
                    </div>
                  </div>

                  {selectedDoc.notes && (
                    <div className="rounded-xl border p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Notes
                      </p>
                      <p className="text-sm">{selectedDoc.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {selectedDoc.hasFile && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => downloadDocument(selectedDoc)}
                      >
                        Download
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setDeleteId(selectedDoc.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Document
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete this document?"
          description={
            <>
              <strong className="text-foreground">{docToDelete?.title}</strong>{" "}
              will be permanently removed from your vault. This cannot be undone.
            </>
          }
          confirmLabel="Yes, delete"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      </div>
    </PageTransition>
  );
}
