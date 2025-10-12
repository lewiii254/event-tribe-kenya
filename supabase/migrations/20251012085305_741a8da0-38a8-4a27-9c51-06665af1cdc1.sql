-- Add foreign key constraint from comments to profiles
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;