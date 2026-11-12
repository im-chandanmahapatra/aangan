
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  interest text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.consultations TO anon, authenticated;
GRANT ALL ON public.consultations TO service_role;

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a consultation"
  ON public.consultations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND (phone IS NULL OR length(phone) <= 30)
    AND (interest IS NULL OR interest IN ('villa','interior','architecture','other'))
    AND (message IS NULL OR length(message) <= 2000)
  );
