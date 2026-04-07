-- Enable RLS on sandbox_alertas table to fix security lint issue
ALTER TABLE "public"."sandbox_alertas" ENABLE ROW LEVEL SECURITY;

-- Add permissive policy for authenticated users (aligning with sandbox usage)
CREATE POLICY "Enable all access for authenticated users" ON "public"."sandbox_alertas"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
