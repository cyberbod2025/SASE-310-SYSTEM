import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdtjebvfoueubortsxre.supabase.co';
const supabaseKey = 'sb_publishable_U1kRWqhblC_HYqMAt1dV2Q_eYNbx5oG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing students insert...");
  const formData = {
    fullName: "Test User",
    email: "test@example.com",
    mobile: "1234567890",
    classId: "00000000-0000-0000-0000-000000000000" // we'll need a real classId to test registrations
  };

  // Get a real classId to make sure foreign key doesn't fail
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
