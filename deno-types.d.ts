// Deno standard library types
declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// Supabase types
declare module "https://esm.sh/@supabase/supabase-js@2.29.0" {
  export * from "@supabase/supabase-js";
}

// Stripe types
declare module "https://esm.sh/stripe@12.5.0" {
  const Stripe: any;
  export default Stripe;
}

// Deno namespace
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  export const env: Env;
} 