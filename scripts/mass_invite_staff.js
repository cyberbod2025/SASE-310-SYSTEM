
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Mapping of Roles from HTML to technical UserRole
const roleMapping = {
  'DIRECCIÓN': 'directivo',
  'SUBDIRECCIÓN': 'subdireccion',
  'DOCENTE': 'docente',
  'PREFECTURA': 'prefectura',
  'ORIENTACIÓN': 'orientacion',
  'TRABAJO SOCIAL': 'trabajo_social',
  'SERVICIO MÉDICO': 'medico_escolar',
  'UDEII': 'udeii',
  'FOMENTO A LA LECTURA': 'promotora_lectura',
  'SECRETARÍA': 'secretaria'
};

const usersToInvite = [
  { nombre: "Miguel Angel Morales Sandoval", usuario: "miguel.morales@sase.mx", clave: "SASE.ADM.2026", rol: "DIRECCIÓN" },
  { nombre: "Neria Diaz Pablo Isaac", usuario: "pablo.neria@sase.mx", clave: "SASE.SUB.2026", rol: "SUBDIRECCIÓN" },
  { nombre: "Lopez Quero Jose Luis", usuario: "jose.lopez@sase.mx", clave: "SASE.SUB.2026", rol: "SUBDIRECCIÓN" },
  { nombre: "Jurado Chavez Victor Alejandro", usuario: "victor.jurado@sase.mx", clave: "SASE.ADM.2026", rol: "DIRECCIÓN" },
  { nombre: "Robledo Osorio Martha Gdpe.", usuario: "martha.robledo@sase.mx", clave: "SASE.EAS.2026", rol: "ORIENTACIÓN" },
  { nombre: "Vargas Andres Diana Alexandra", usuario: "diana.vargas@sase.mx", clave: "SASE.EAS.2026", rol: "ORIENTACIÓN" },
  { nombre: "Villalobos Cervantes Silvia Y.", usuario: "silvia.villalobos@sase.mx", clave: "SASE.EAS.2026", rol: "TRABAJO SOCIAL" },
  { nombre: "Xolalpa Jimenez Norma Lorena", usuario: "norma.xolalpa@sase.mx", clave: "SASE.EAS.2026", rol: "SERVICIO MÉDICO" },
  { nombre: "Ingrid Gonzalez Navarrete", usuario: "ingrid.gonzalez@sase.mx", clave: "SASE.EAS.2026", rol: "UDEII" },
  { nombre: "Guerrero Perez Susana", usuario: "susana.guerrero@sase.mx", clave: "SASE.EAS.2026", rol: "FOMENTO A LA LECTURA" },
  { nombre: "Cortes Baizabal German", usuario: "german.cortes@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Legaria Gordillo Jose Luis", usuario: "jose.legaria@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Ramirez Teloxa Angeles Yeraldin", usuario: "angeles.ramirez@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Vallerrojo Malla Ma. Del Socorro", usuario: "ma.vallerrojo@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Bernal Estrada Marisol", usuario: "marisol.bernal@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Cortes Rojas Juan Antonio", usuario: "juan.cortes@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Urbano Lopez Hans Edson", usuario: "hans.urbano@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Sanchez Resendiz Hugo", usuario: "hugo.sanchez@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Tabarez Casarrubias Baltazar", usuario: "baltazar.tabarez@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Echevarria Garcia Elizabeth", usuario: "elizabeth.echevarria@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Hernandez Marcos Pedro", usuario: "pedro.hernandez@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Cortes Salmeron Jairo David", usuario: "jairo.cortes@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Cruz Marin Fermin Antonio", usuario: "fermin.cruz@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Rosas Bello Jorge Luis", usuario: "jorge.rosas@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Pina Fuentes Dulce Janette", usuario: "dulce.pina@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Perez Perez Kimberly", usuario: "kimberly.perez@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Diaz Villanueva Brenda Josahany", usuario: "brenda.diaz@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Rivera Garcia Pablo Miguel", usuario: "pablo.rivera@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Rangel Bandy Jorge Antonio", usuario: "jorge.rangel@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Guerrero Orozco Norma P.", usuario: "norma.guerrero@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Hurtado Marin Juan Jose", usuario: "juan.hurtado@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Flores Lopez Victor Manuel", usuario: "victor.flores@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Gutierrez Avendano Diana Belem", usuario: "diana.gutierrez@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Arellano Santoyo Miguel", usuario: "miguel.arellano@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Mota Cano Noe", usuario: "noe.mota@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Morales Navarrete Ruth", usuario: "ruth.morales@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Ramírez Silva Vicente", usuario: "vicente.ramirez@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Contreras Martinez Joselyn", usuario: "joselyn.contreras@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Andrade Galicia Claudia", usuario: "claudia.andrade@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Flores Silva Jorge Alberto", usuario: "jorge.flores@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Campos Vilchis Eduardo", usuario: "eduardo.campos@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Rivera Cruz Oralia", usuario: "oralia.rivera@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Azuceno Gil Juventina Rocio", usuario: "juventina.azuceno@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Diaz Nuñez Maria Elena", usuario: "maria.diaz@sase.mx", clave: "SASE.DOCENTE.2026", rol: "DOCENTE" },
  { nombre: "Alvarez Gomez Juan Luis", usuario: "juan.alvarez@sase.mx", clave: "SASE.PREFECTO.2026", rol: "PREFECTURA" },
  { nombre: "Garcia Peñaloza Marcelina Paula", usuario: "paula.garcia@sase.mx", clave: "SASE.PREFECTO.2026", rol: "PREFECTURA" },
  { nombre: "Medina Franco Jose Luis", usuario: "jose.medina@sase.mx", clave: "SASE.PREFECTO.2026", rol: "PREFECTURA" },
  { nombre: "Diaz Ruiz Edgar", usuario: "edgar.diaz@sase.mx", clave: "SASE.SEC.2026", rol: "SECRETARÍA" },
  { nombre: "Flores Calvillo Gabriela", usuario: "gabriela.flores@sase.mx", clave: "SASE.SEC.2026", rol: "SECRETARÍA" },
  { nombre: "Galindo Argueta Dulce Maria", usuario: "dulce.galindo@sase.mx", clave: "SASE.SEC.2026", rol: "SECRETARÍA" },
  { nombre: "Rodriguez Marquez Jorge", usuario: "jorge.rodriguez@sase.mx", clave: "SASE.SEC.2026", rol: "SECRETARÍA" }
];

async function runInvitations() {
  console.log('Iniciando pre-creación de Usuarios Institucionales SASE-310...');
  
  for (const user of usersToInvite) {
    const technicalRole = roleMapping[user.rol];
    console.log(`Creando a [${user.nombre}] - ${user.usuario}...`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.usuario,
      password: user.clave,
      email_confirm: true,
      user_metadata: {
        role: technicalRole,
        full_name: user.nombre
      }
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        console.warn(`Aviso: El usuario ${user.usuario} ya existe.`);
      } else {
        console.error(`Error al crear a ${user.usuario}:`, error.message);
      }
    } else {
      console.log(`Hecho: Usuario ${user.usuario} creado con éxito.`);
    }
    
    await new Promise(r => setTimeout(r, 400));
  }
  
  console.log('Proceso finalizado.');
}

runInvitations().catch(console.error);
