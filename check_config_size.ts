import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uiihcsatdyjrqtninqwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaWhjc2F0ZHlqcnF0bmlucXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzE2NTIsImV4cCI6MjA4Nzc0NzY1Mn0.D7T8PlK6235S6kin2-_DMepBLDaxIirczrMAp_ERSC0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConfigSize() {
  const { data, error } = await supabase.from('site_config').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  let totalSize = 0;
  for (const item of data) {
    const size = item.value ? item.value.length : 0;
    totalSize += size;
    console.log(`${item.key}: ${size} bytes`);
  }
  console.log(`Total size: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
}

checkConfigSize();
