-- Create solicitudes table
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  descripcion TEXT,
  asignado_a TEXT, -- ID of the secretary
  asignado_nombre TEXT, -- Denormalized name for display
  prioridad TEXT CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  estado TEXT CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')) DEFAULT 'pendiente',
  fecha_limite DATE,
  alumno_id UUID REFERENCES alumnos(id), -- Foreign key to alumnos table
  alumno_nombre TEXT, -- Denormalized name for display
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) -- Foreign key to auth.users
);

-- Create comunicados table
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('evento', 'comunicado', 'recordatorio', 'urgente')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  audiencia TEXT[], -- Array of audience roles
  fecha_evento DATE,
  hora_evento TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for now, adjust strictly for production)
-- Allow authenticated users to select all
CREATE POLICY "Enable read access for authenticated users" ON solicitudes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON comunicados FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users" ON solicitudes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON comunicados FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own creations or assigned tasks (simplified)
CREATE POLICY "Enable update for creators and assignees" ON solicitudes FOR UPDATE USING (auth.uid() = created_by OR auth.uid()::text = asignado_a);
