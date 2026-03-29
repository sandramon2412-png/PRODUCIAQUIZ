import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://euauqqamrkqwoytveljp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1YXVxcWFtcmtxd295dHZlbGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjc5ODcsImV4cCI6MjA4OTcwMzk4N30.-047G98I5ecegiWBmkItSgYkhv37AAgTOOZoeB-iAIo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
