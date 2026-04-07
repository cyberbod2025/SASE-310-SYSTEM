-- ============================================
-- SASE-310: Registro oficial de personal
-- Migracion: 20260310120000_official_staff_registry
-- ============================================

CREATE TABLE IF NOT EXISTS public.personal_oficial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    full_name_normalized TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    username TEXT,
    temporary_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_oficial_full_name
ON public.personal_oficial(full_name);

CREATE INDEX IF NOT EXISTS idx_personal_oficial_full_name_normalized
ON public.personal_oficial(full_name_normalized);

CREATE INDEX IF NOT EXISTS idx_personal_oficial_role
ON public.personal_oficial(role);

CREATE INDEX IF NOT EXISTS idx_personal_oficial_active
ON public.personal_oficial(is_active);

ALTER TABLE public.personal_oficial ENABLE ROW LEVEL SECURITY;

INSERT INTO public.personal_oficial (
    full_name,
    full_name_normalized,
    department,
    role,
    is_active,
    username,
    temporary_code
) VALUES
    ('MIGUEL ANGEL MORALES SANDOVAL', 'MIGUEL ANGEL MORALES SANDOVAL', 'DIRECCION', 'directivo', true, 'miguel.morales', null),
    ('NERIA DIAZ PABLO ISAAC', 'NERIA DIAZ PABLO ISAAC', 'SUBDIRECCION', 'subdireccion', true, 'pablo.neria', null),
    ('LOPEZ QUERO JOSE LUIS', 'LOPEZ QUERO JOSE LUIS', 'SUBDIRECCION', 'subdireccion', true, 'jose.lopez', null),
    ('JURADO CHAVEZ VICTOR ALEJANDRO', 'JURADO CHAVEZ VICTOR ALEJANDRO', 'CONTRALORIA', 'directivo', true, 'victor.jurado', null),
    ('ROBLEDO OSORIO MARTHA GDPE.', 'ROBLEDO OSORIO MARTHA GDPE.', 'ORIENTACION', 'orientacion', true, 'martha.robledo', null),
    ('VARGAS ANDRES DIANA ALEXANDRA', 'VARGAS ANDRES DIANA ALEXANDRA', 'ORIENTACION', 'orientacion', true, 'diana.vargas', null),
    ('VILLALOBOS CERVANTES SILVIA Y.', 'VILLALOBOS CERVANTES SILVIA Y.', 'TRABAJO SOCIAL', 'trabajo_social', true, 'silvia.villalobos', null),
    ('XOLALPA JIMENEZ NORMA LORENA', 'XOLALPA JIMENEZ NORMA LORENA', 'MEDICO ESCOLAR', 'medico_escolar', true, 'norma.xolalpa', null),
    ('INGRID GONZALEZ NAVARRETE', 'INGRID GONZALEZ NAVARRETE', 'UDEII', 'udeii', true, 'ingrid.gonzalez', null),
    ('GUERRERO PEREZ SUSANA', 'GUERRERO PEREZ SUSANA', 'PROMOTORA L.E', 'promotora_lectura', true, 'susana.guerrero', null),
    ('CORTES BAIZABAL GERMAN', 'CORTES BAIZABAL GERMAN', 'ESPAÑOL', 'docente', true, 'german.cortes', null),
    ('LEGARIA GORDILLO JOSE LUIS', 'LEGARIA GORDILLO JOSE LUIS', 'ESPAÑOL', 'docente', true, 'jose.legaria', null),
    ('RAMIREZ TELOXA ANGELES YERALDIN', 'RAMIREZ TELOXA ANGELES YERALDIN', 'ESPAÑOL', 'docente', true, 'angeles.ramirez', null),
    ('VALLERROJO MALLA MA. DEL SOCORRO', 'VALLERROJO MALLA MA. DEL SOCORRO', 'ESPAÑOL', 'docente', true, 'ma.vallerrojo', null),
    ('BERNAL ESTRADA MARISOL', 'BERNAL ESTRADA MARISOL', 'MATEMÁTICAS', 'docente', true, 'marisol.bernal', null),
    ('CORTES ROJAS JUAN ANTONIO', 'CORTES ROJAS JUAN ANTONIO', 'MATEMÁTICAS', 'docente', true, 'juan.cortes', null),
    ('URBANO LOPEZ HANS EDSON', 'URBANO LOPEZ HANS EDSON', 'MATEMÁTICAS', 'docente', true, 'hans.urbano', null),
    ('SANCHEZ RESENDIZ HUGO', 'SANCHEZ RESENDIZ HUGO', 'MATEMÁTICAS', 'docente', true, 'hugo.sanchez', null),
    ('TABAREZ CASARRUBIAS BALTAZAR', 'TABAREZ CASARRUBIAS BALTAZAR', 'HISTORIA', 'docente', true, 'baltazar.tabarez', null),
    ('ECHEVARRIA GARCIA ELIZABETH', 'ECHEVARRIA GARCIA ELIZABETH', 'HISTORIA', 'docente', true, 'elizabeth.echevarria', null),
    ('HERNANDEZ MARCOS PEDRO', 'HERNANDEZ MARCOS PEDRO', 'HISTORIA', 'docente', true, 'pedro.hernandez', null),
    ('CORTES SALMERON JAIRO DAVID', 'CORTES SALMERON JAIRO DAVID', 'GEOGRAFÍA', 'docente', true, 'jairo.cortes', null),
    ('CRUZ MARIN FERMIN ANTONIO', 'CRUZ MARIN FERMIN ANTONIO', 'F.CÍVICA Y ÉTICA', 'docente', true, 'fermin.cruz', null),
    ('ROSAS BELLO JORGE LUIS', 'ROSAS BELLO JORGE LUIS', 'F.CÍVICA Y ÉTICA', 'docente', true, 'jorge.rosas', null),
    ('PINA FUENTES DULCE JANETTE', 'PINA FUENTES DULCE JANETTE', 'CIENCIAS QUÍMICA', 'docente', true, 'dulce.pina', null),
    ('PEREZ PEREZ KIMBERLY', 'PEREZ PEREZ KIMBERLY', 'CIENCIAS QUÍMICA', 'docente', true, 'kimberly.perez', null),
    ('DIAZ VILLANUEVA BRENDA JOSAHANY', 'DIAZ VILLANUEVA BRENDA JOSAHANY', 'BIOLOGÍA', 'docente', true, 'brenda.diaz', null),
    ('RIVERA GARCIA PABLO MIGUEL', 'RIVERA GARCIA PABLO MIGUEL', 'FÍSICA', 'docente', true, 'pablo.rivera', null),
    ('RANGEL BANDY JORGE ANTONIO', 'RANGEL BANDY JORGE ANTONIO', 'FÍSICA', 'docente', true, 'jorge.rangel', null),
    ('GUERRERO OROZCO NORMA P.', 'GUERRERO OROZCO NORMA P.', 'INGLÉS', 'docente', true, 'norma.guerrero', null),
    ('HURTADO MARIN JUAN JOSE', 'HURTADO MARIN JUAN JOSE', 'INGLÉS', 'docente', true, 'juan.hurtado', null),
    ('FLORES LOPEZ VICTOR MANUEL', 'FLORES LOPEZ VICTOR MANUEL', 'ARTES', 'docente', true, 'victor.flores', null),
    ('GUTIERREZ AVENDANO DIANA BELEM', 'GUTIERREZ AVENDANO DIANA BELEM', 'MÚSICA', 'docente', true, 'diana.gutierrez', null),
    ('ARELLANO SANTOYO MIGUEL', 'ARELLANO SANTOYO MIGUEL', 'EDUC. FÍSICA', 'docente', true, 'miguel.arellano', null),
    ('MOTA CANO NOE', 'MOTA CANO NOE', 'EDUC. FÍSICA', 'docente', true, 'noe.mota', null),
    ('MORALES NAVARRETE RUTH', 'MORALES NAVARRETE RUTH', 'DISEÑO ARQUITEC.', 'docente', true, 'ruth.morales', null),
    ('RAMÍREZ SILVA VICENTE', 'RAMIREZ SILVA VICENTE', 'DISEÑO ARQUITEC.', 'docente', true, 'vicente.ramirez', null),
    ('CONTRERAS MARTINEZ JOSELYN', 'CONTRERAS MARTINEZ JOSELYN', 'CONF. DEL VESTIDO', 'docente', true, 'joselyn.contreras', null),
    ('ANDRADE GALICIA CLAUDIA', 'ANDRADE GALICIA CLAUDIA', 'DISEÑO GRÁFICO', 'docente', true, 'claudia.andrade', null),
    ('FLORES SILVA JORGE ALBERTO', 'FLORES SILVA JORGE ALBERTO', 'DISEÑO DE CIR.', 'docente', true, 'jorge.flores', null),
    ('CAMPOS VILCHIS EDUARDO', 'CAMPOS VILCHIS EDUARDO', 'DISEÑO DE EST.', 'docente', true, 'eduardo.campos', null),
    ('RIVERA CRUZ ORALIA', 'RIVERA CRUZ ORALIA', 'METÁLICAS', 'docente', true, 'oralia.rivera', null),
    ('AZUCENO GIL JUVENTINA ROCIO', 'AZUCENO GIL JUVENTINA ROCIO', 'OFIMÁTICA', 'docente', true, 'juventina.azuceno', null),
    ('DIAZ NUÑEZ MARIA ELENA', 'DIAZ NUNEZ MARIA ELENA', 'OFIMÁTICA', 'docente', true, 'maria.diaz', null),
    ('ALVAREZ GOMEZ JUAN LUIS', 'ALVAREZ GOMEZ JUAN LUIS', 'PREFECTURA', 'prefectura', true, 'juan.alvarez', null),
    ('GARCIA PEÑALOZA MARCELINA PAULA', 'GARCIA PENALOZA MARCELINA PAULA', 'PREFECTURA', 'prefectura', true, 'paula.garcia', null),
    ('MEDINA FRANCO JOSE LUIS', 'MEDINA FRANCO JOSE LUIS', 'PREFECTURA', 'prefectura', true, 'jose.medina', null),
    ('DIAZ RUIZ EDGAR', 'DIAZ RUIZ EDGAR', 'SECRETARÍA', 'secretaria', true, 'edgar.diaz', null),
    ('FLORES CALVILLO GABRIELA', 'FLORES CALVILLO GABRIELA', 'SECRETARÍA', 'secretaria', true, 'gabriela.flores', null),
    ('GALINDO ARGUETA DULCE MARIA', 'GALINDO ARGUETA DULCE MARIA', 'SECRETARÍA', 'secretaria', true, 'dulce.galindo', null),
    ('RODRIGUEZ MARQUEZ JORGE', 'RODRIGUEZ MARQUEZ JORGE', 'SECRETARÍA', 'secretaria', true, 'jorge.rodriguez', null);
