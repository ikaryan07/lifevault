import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: documents } = await supabase
    .from("documents")
    .select("title, category, file_name, uploaded_at")
    .eq("user_id", user.id)
    .order("category");

  const { data: contacts } = await supabase
    .from("trusted_contacts")
    .select("name, email, phone, relationship, access_level, invitation_status")
    .eq("user_id", user.id);

  const { data: importantContacts } = await supabase
    .from("important_contacts")
    .select("name, role, company, phone, email")
    .eq("user_id", user.id);

  const { data: digitalAssets } = await supabase
    .from("digital_assets")
    .select("name, type, url, username, action")
    .eq("user_id", user.id);

  const { data: checklistProgress } = await supabase
    .from("checklist_progress")
    .select("item_id, list_type, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  const generatedDate = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = generatePDFHtml({
    profile,
    documents: documents || [],
    contacts: contacts || [],
    importantContacts: importantContacts || [],
    digitalAssets: digitalAssets || [],
    checklistProgress: checklistProgress || [],
    generatedDate,
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="HomePin_Summary_${generatedDate.replace(/\s/g, '_')}.html"`,
    },
  });
}

function generatePDFHtml(data: {
  profile: any;
  documents: any[];
  contacts: any[];
  importantContacts: any[];
  digitalAssets: any[];
  checklistProgress: any[];
  generatedDate: string;
}) {
  const { profile, documents, contacts, importantContacts, digitalAssets, checklistProgress, generatedDate } = data;

  const completedBefore = checklistProgress.filter((c) => c.list_type === "before").length;
  const completedAfter = checklistProgress.filter((c) => c.list_type === "after").length;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HomePin Summary - ${profile?.first_name} ${profile?.last_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #1a5276; }
    h2 { font-size: 20px; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; color: #1a5276; }
    h3 { font-size: 16px; margin: 16px 0 8px; }
    p { margin-bottom: 8px; }
    .meta { color: #666; font-size: 14px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #1a5276; }
    .section { page-break-inside: avoid; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    th { background: #f8f9fa; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #e5e7eb; }
    .stats { display: flex; gap: 24px; margin: 16px 0; }
    .stat { background: #f8f9fa; padding: 16px; border-radius: 8px; flex: 1; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a5276; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 12px; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>HomePin Summary</h1>
    <p class="meta">Prepared for: <strong>${profile?.first_name || ""} ${profile?.last_name || ""}</strong></p>
    <p class="meta">Generated: ${generatedDate}</p>
  </div>

  <div class="warning">
    <strong>Important:</strong> This document contains a summary of your vault contents. 
    It does NOT include passwords, file contents, or encryption keys. 
    Keep it in a safe place or give it to your solicitor.
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${documents.length}</div>
      <div class="stat-label">Documents</div>
    </div>
    <div class="stat">
      <div class="stat-value">${contacts.length}</div>
      <div class="stat-label">Trusted Contacts</div>
    </div>
    <div class="stat">
      <div class="stat-value">${completedBefore}/16</div>
      <div class="stat-label">Planning Items Done</div>
    </div>
    <div class="stat">
      <div class="stat-value">${digitalAssets.length}</div>
      <div class="stat-label">Digital Accounts</div>
    </div>
  </div>

  ${documents.length > 0 ? `
  <div class="section">
    <h2>Documents in Vault</h2>
    <table>
      <thead><tr><th>Title</th><th>Category</th><th>File</th><th>Uploaded</th></tr></thead>
      <tbody>
        ${documents.map((d) => `<tr><td>${d.title}</td><td><span class="badge">${d.category}</span></td><td>${d.file_name}</td><td>${new Date(d.uploaded_at).toLocaleDateString("en-AU")}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>` : ""}

  ${contacts.length > 0 ? `
  <div class="section">
    <h2>Trusted Contacts</h2>
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Relationship</th><th>Access</th><th>Status</th></tr></thead>
      <tbody>
        ${contacts.map((c) => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone || "-"}</td><td>${c.relationship || "-"}</td><td><span class="badge">${c.access_level.replace(/_/g, " ")}</span></td><td>${c.invitation_status}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>` : ""}

  ${importantContacts.length > 0 ? `
  <div class="section">
    <h2>Professional Contacts</h2>
    <table>
      <thead><tr><th>Name</th><th>Role</th><th>Company</th><th>Phone</th><th>Email</th></tr></thead>
      <tbody>
        ${importantContacts.map((c) => `<tr><td>${c.name}</td><td>${c.role}</td><td>${c.company || "-"}</td><td>${c.phone || "-"}</td><td>${c.email || "-"}</td></tr>`).join("")}
      </tbody>
    </table>
  </div>` : ""}

  ${digitalAssets.length > 0 ? `
  <div class="section">
    <h2>Digital Accounts</h2>
    <table>
      <thead><tr><th>Name</th><th>Type</th><th>URL</th><th>Username</th><th>Action</th></tr></thead>
      <tbody>
        ${digitalAssets.map((a) => `<tr><td>${a.name}</td><td>${a.type}</td><td>${a.url || "-"}</td><td>${a.username || "-"}</td><td><span class="badge">${a.action}</span></td></tr>`).join("")}
      </tbody>
    </table>
  </div>` : ""}

  <div class="footer">
    <p>Generated by HomePin &middot; HomePin.com.au &middot; Secure end-of-life planning for Australian families</p>
    <p style="margin-top: 4px;">This document does not contain any encrypted content, passwords, or sensitive file data.</p>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 32px;">
    <button onclick="window.print()" style="background: #1a5276; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>`;
}
