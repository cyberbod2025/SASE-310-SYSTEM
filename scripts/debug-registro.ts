import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing students insert...");
  const formData = {
    fullName: "Test User",
    email: "test@example.com",
    mobile: "1234567890",
    classId: "00000000-0000-0000-0000-000000000000"
  };

  const { data: classes } = await supabase.from('classes').select('id').limit(1);
  if (classes && classes.length > 0) {
    formData.classId = classes[0].id;
  }

  const { data: newStudent, error: insertError } = await supabase
    .from('students')
    .insert([
      {
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile
      }
    ])
    .select('id')
    .single();

  if (insertError) {
    console.error("Error inserting into students:", JSON.stringify(insertError, null, 2));
    return;
  }
  
  console.log("Inserted student successfully:", newStudent);

  const studentId = newStudent.id;

  console.log("Testing registrations insert...");
  const { error: regError } = await supabase.from('registrations').insert([
    {
      class_id: formData.classId,
      student_id: studentId,
      is_committed: true,
      understands_goal: true,
      will_cancel_in_time: true,
      referred_by_email: undefined
    }
  ]);

  if (regError) {
    console.error("Error inserting into registrations:", JSON.stringify(regError, null, 2));
    return;
  }

  console.log("Inserted registration successfully!");
}

testInsert().catch(console.error);
