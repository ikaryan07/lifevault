-- Production readiness: vault access RLS, storage bucket, invite acceptance

-- Vault access: owners see all requests for their vault
DROP POLICY IF EXISTS "Owners can view vault access requests" ON public.vault_access_requests;
CREATE POLICY "Owners can view vault access requests"
  ON public.vault_access_requests FOR SELECT
  USING (auth.uid() = vault_owner_id);

-- Trusted contacts who are requesters can view their requests
CREATE POLICY "Requesters can view own vault access requests"
  ON public.vault_access_requests FOR SELECT
  USING (
    requester_id IN (
      SELECT id FROM public.trusted_contacts
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        AND invitation_status = 'accepted'
    )
  );

-- Other trusted contacts can view pending requests for vaults they belong to
CREATE POLICY "Trusted contacts can view pending requests"
  ON public.vault_access_requests FOR SELECT
  USING (
    status = 'pending'
    AND vault_owner_id IN (
      SELECT user_id FROM public.trusted_contacts
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "Trusted contacts can create vault access requests"
  ON public.vault_access_requests FOR INSERT
  WITH CHECK (
    requester_id IN (
      SELECT id FROM public.trusted_contacts
      WHERE user_id = vault_owner_id
        AND email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "Trusted contacts can update vault access requests"
  ON public.vault_access_requests FOR UPDATE
  USING (
    vault_owner_id IN (
      SELECT user_id FROM public.trusted_contacts
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        AND invitation_status = 'accepted'
    )
    OR auth.uid() = vault_owner_id
  );

CREATE POLICY "Trusted contacts can insert confirmations"
  ON public.vault_access_confirmations FOR INSERT
  WITH CHECK (
    confirmer_id IN (
      SELECT tc.id FROM public.trusted_contacts tc
      JOIN public.vault_access_requests var ON var.id = request_id
      WHERE tc.user_id = var.vault_owner_id
        AND tc.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        AND tc.invitation_status = 'accepted'
    )
  );

CREATE POLICY "Parties can view vault access confirmations"
  ON public.vault_access_confirmations FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM public.vault_access_requests
      WHERE vault_owner_id = auth.uid()
        OR requester_id IN (
          SELECT id FROM public.trusted_contacts
          WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        )
    )
  );

-- Invited users can accept their own trusted-contact invite
CREATE POLICY "Invitees can accept trusted contact invite"
  ON public.trusted_contacts FOR UPDATE
  USING (
    invitation_status = 'pending'
    AND invitation_token IS NOT NULL
    AND email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (invitation_status IN ('accepted', 'declined'));

-- Invited users can view their pending invite
CREATE POLICY "Invitees can view own pending invite"
  ON public.trusted_contacts FOR SELECT
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Approved requesters can read owner's legacy data (read-only vault access)
CREATE POLICY "Approved access can view owner documents"
  ON public.documents FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT var.vault_owner_id FROM public.vault_access_requests var
      JOIN public.trusted_contacts tc ON tc.id = var.requester_id
      WHERE var.status = 'approved'
        AND tc.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Approved access can view owner important contacts"
  ON public.important_contacts FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT var.vault_owner_id FROM public.vault_access_requests var
      JOIN public.trusted_contacts tc ON tc.id = var.requester_id
      WHERE var.status = 'approved'
        AND tc.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Approved access can view owner checklist"
  ON public.checklist_progress FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT var.vault_owner_id FROM public.vault_access_requests var
      JOIN public.trusted_contacts tc ON tc.id = var.requester_id
      WHERE var.status = 'approved'
        AND tc.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Storage bucket for encrypted documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
