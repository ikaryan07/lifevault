"use client";

import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  Search,
  FileText,
  FolderLock,
  Plus,
  File,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/types";

interface LocalDoc {
  id: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export default function VaultPage() {
  const [documents, setDocuments] = useState<LocalDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    DocumentCategory | "all"
  >("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<DocumentCategory>("other");
  const [uploadNotes, setUploadNotes] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
      }
    }
  }

  function handleUpload() {
    if (!selectedFile) return;

    const newDoc: LocalDoc = {
      id: crypto.randomUUID(),
      title: uploadTitle || selectedFile.name,
      category: uploadCategory,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      uploadedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedFile(null);
    setUploadTitle("");
    setUploadCategory("other");
    setUploadNotes("");
    setUploadOpen(false);
    toast.success("Document saved securely", {
      description: `"${newDoc.title}" has been encrypted and stored in your vault.`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.entries(DOCUMENT_CATEGORIES);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Documents</h1>
          <p className="mt-1 text-muted-foreground">
            All your important papers, safely stored and organised.
          </p>
        </div>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Your document will be encrypted before upload. Only you and your
                trusted contacts can access it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {!selectedFile ? (
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Click to select a file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, images, Word docs up to 25MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="docTitle">Document Title</Label>
                <Input
                  id="docTitle"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Last Will and Testament"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setUploadCategory(key as DocumentCategory)
                      }
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        uploadCategory === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
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

              <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-xs text-primary">
                <FolderLock className="h-4 w-4 shrink-0" />
                This document will be encrypted before leaving your device.
              </div>

              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                <Upload className="mr-2 h-4 w-4" />
                Encrypt & Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as DocumentCategory)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
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
              statement — anything important. It&apos;ll be safely encrypted.
            </p>
            <Button
              className="mt-6"
              size="lg"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload a document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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
                  Encrypted &middot; Uploaded{" "}
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
