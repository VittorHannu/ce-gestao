-- Create the relato_images table
CREATE TABLE public.relato_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    relato_id uuid NOT NULL REFERENCES public.relatos(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) for relato_images
ALTER TABLE public.relato_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for relato_images
CREATE POLICY "Allow authenticated users to view relato_images" ON public.relato_images
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert their own relato_images" ON public.relato_images
FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.relatos WHERE id = relato_id));

CREATE POLICY "Allow users to update their own relato_images" ON public.relato_images
FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.relatos WHERE id = relato_id));

CREATE POLICY "Allow users to delete their own relato_images" ON public.relato_images
FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.relatos WHERE id = relato_id));

-- Copy existing image_url data from relatos to relato_images
INSERT INTO public.relato_images (relato_id, image_url, created_at)
SELECT id, image_url, created_at
FROM public.relatos
WHERE image_url IS NOT NULL;

-- Drop the image_url column from the relatos table
ALTER TABLE public.relatos
DROP COLUMN image_url;
