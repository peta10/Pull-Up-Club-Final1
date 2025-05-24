-- Create messages_log table
CREATE TABLE public.messages_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    message_type text NOT NULL,
    content text NOT NULL,
    delivery_status text,
    sent_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messages"
    ON public.messages_log
    FOR SELECT
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all messages"
    ON public.messages_log
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admin users can insert messages"
    ON public.messages_log
    FOR INSERT
    TO public
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )); 