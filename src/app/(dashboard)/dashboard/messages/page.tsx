"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Video,
  Mic,
  MessageSquare,
  Plus,
  Trash2,
  Heart,
  StopCircle,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lifevault:messages";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

interface Message {
  id: string;
  title: string;
  type: "video" | "audio" | "text";
  content?: string;
  recipientName?: string;
  deliverOn?: string;
  createdAt: string;
}

interface MessageRow {
  id: string;
  title: string;
  type: "video" | "audio" | "text";
  content: string | null;
  recipient_name: string | null;
  deliver_on: string | null;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"video" | "audio" | "text">("text");
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [deliverOn, setDeliverOn] = useState("");
  const [textContent, setTextContent] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      if (!isSupabaseConfigured) {
        setMessages(safeParse<Message[]>(localStorage.getItem(STORAGE_KEY), []));
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setMessages((data as MessageRow[]).map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          content: m.content ?? undefined,
          recipientName: m.recipient_name ?? undefined,
          deliverOn: m.deliver_on ?? undefined,
          createdAt: m.created_at,
        })));
      }
      setLoading(false);
    }
    loadMessages();
  }, []);

  function resetForm() {
    setTitle("");
    setRecipientName("");
    setDeliverOn("");
    setTextContent("");
    setRecordedBlob(null);
    setMessageType("text");
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        messageType === "video" ? { video: true, audio: true } : { audio: true }
      );
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: messageType === "video" ? "video/webm" : "audio/webm",
        });
        setRecordedBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch {
      toast.error("Permission denied", {
        description: "Please allow access to your camera/microphone.",
      });
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }
    if (messageType === "text" && !textContent.trim()) {
      toast.error("Please write your message");
      return;
    }
    if ((messageType === "video" || messageType === "audio") && !recordedBlob) {
      toast.error("Please record before saving");
      return;
    }

    if (!isSupabaseConfigured) {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        title: title.trim(),
        type: messageType,
        content: messageType === "text" ? textContent.trim() : undefined,
        recipientName: recipientName.trim() || undefined,
        deliverOn: deliverOn.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      const updated = [newMessage, ...messages];
      setMessages(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success("Message saved", { description: "Your message has been securely stored." });
    } else {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let filePath: string | null = null;

      if (recordedBlob && (messageType === "video" || messageType === "audio")) {
        const fileName = `${user.id}/messages/${crypto.randomUUID()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, recordedBlob, { contentType: recordedBlob.type });

        if (uploadError) {
          toast.error("Upload failed", { description: uploadError.message });
          return;
        }
        filePath = fileName;
      }

      const { data: inserted, error } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          title: title.trim(),
          type: messageType,
          file_path: filePath,
          content: messageType === "text" ? textContent.trim() : null,
          recipient_name: recipientName.trim() || null,
          deliver_on: deliverOn.trim() || null,
        })
        .select()
        .single<MessageRow>();

      if (error || !inserted) {
        toast.error("Failed to save", { description: error?.message });
        return;
      }

      const savedMessage: Message = {
        id: inserted.id,
        title: inserted.title,
        type: inserted.type,
        content: inserted.content ?? undefined,
        recipientName: inserted.recipient_name ?? undefined,
        deliverOn: inserted.deliver_on ?? undefined,
        createdAt: inserted.created_at,
      };

      toast.success("Message saved", { description: "Your message has been securely stored." });
      setMessages((prev) => [savedMessage, ...prev]);
    }

    setCreateOpen(false);
    resetForm();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    if (!isSupabaseConfigured) {
      const updated = messages.filter((m) => m.id !== id);
      setMessages(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      const supabase = createClient();
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete", { description: error.message });
        return;
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
    setDeleteId(null);
    toast.success("Message deleted");
  }

  const messageToDelete = deleteId
    ? messages.find((m) => m.id === deleteId)
    : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const typeIcon = { video: Video, audio: Mic, text: MessageSquare };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages for Loved Ones</h1>
            <p className="mt-1 text-muted-foreground">
              Record video, audio, or written messages to be shared with your family when the time comes.
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger render={<Button size="lg" />}>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a Message</DialogTitle>
                <DialogDescription>
                  Leave a message for someone you love. It will be stored securely
                  and shared when your trusted contacts gain access.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  {(["text", "audio", "video"] as const).map((t) => {
                    const Icon = typeIcon[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setMessageType(t)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors",
                          messageType === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium capitalize">{t}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. For my grandchildren"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recipient (optional)</Label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sarah, or 'My family'"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deliver on (optional)</Label>
                  <Input
                    value={deliverOn}
                    onChange={(e) => setDeliverOn(e.target.value)}
                    placeholder="e.g. Their wedding day, Christmas 2030"
                  />
                </div>

                {messageType === "text" ? (
                  <div className="space-y-2">
                    <Label>Your message</Label>
                    <Textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Write your message here..."
                      rows={6}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label>{messageType === "video" ? "Record Video" : "Record Audio"}</Label>
                    <div className="flex items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8">
                      {recording ? (
                        <Button
                          variant="destructive"
                          size="lg"
                          onClick={stopRecording}
                        >
                          <StopCircle className="mr-2 h-5 w-5" />
                          Stop Recording
                        </Button>
                      ) : recordedBlob ? (
                        <div className="text-center">
                          <p className="text-sm text-green-600 font-medium">Recording saved!</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setRecordedBlob(null)}
                          >
                            Record again
                          </Button>
                        </div>
                      ) : (
                        <Button size="lg" onClick={startRecording}>
                          <Circle className="mr-2 h-5 w-5 text-red-500" />
                          Start Recording
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <Button onClick={handleSave} className="w-full" size="lg">
                  <Heart className="mr-2 h-4 w-4" />
                  Save Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {messages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Leave a message for someone you love</h3>
              <p className="mt-2 max-w-sm text-center text-muted-foreground">
                Record a video, voice note, or written message. It will be delivered to
                your loved ones when your trusted contacts access the vault.
              </p>
              <Button className="mt-6" size="lg" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first message
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence>
              {messages.map((msg) => {
                const Icon = typeIcon[msg.type];
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <button
                            onClick={() => setDeleteId(msg.id)}
                            aria-label={`Delete ${msg.title}`}
                            className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <CardTitle className="mt-2 text-base">{msg.title}</CardTitle>
                        <CardDescription>
                          {msg.recipientName && `For ${msg.recipientName} · `}
                          {msg.type} message
                          {msg.deliverOn && ` · Deliver: ${msg.deliverOn}`}
                        </CardDescription>
                      </CardHeader>
                      {msg.content && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {msg.content}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete this message?"
          description={
            <>
              <strong className="text-foreground">{messageToDelete?.title}</strong>{" "}
              will be permanently removed. This cannot be undone.
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
