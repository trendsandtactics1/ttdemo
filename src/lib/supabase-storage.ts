import { supabase } from "@/integrations/supabase/client";

export const createProfilesBucket = async () => {
  const { data, error } = await supabase.storage.createBucket('profiles', {
    public: true,
    fileSizeLimit: 1024 * 1024 * 2, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
  });
  
  if (error) {
    console.error('Error creating profiles bucket:', error);
  }
  return { data, error };
};