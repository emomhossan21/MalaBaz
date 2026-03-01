import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uiihcsatdyjrqtninqwp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaWhjc2F0ZHlqcnF0bmlucXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzE2NTIsImV4cCI6MjA4Nzc0NzY1Mn0.D7T8PlK6235S6kin2-_DMepBLDaxIirczrMAp_ERSC0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
  const { data, error } = await supabase.storage.createBucket('images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 52428800 // 50MB
  });
  console.log('Bucket created:', data);
  if (error) console.error('Error:', error);
}

setupBucket();
