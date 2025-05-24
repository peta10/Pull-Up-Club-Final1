/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  export const env: Env;
}

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.29.0" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/stripe@12.5.0" {
  const Stripe: any;
  export default Stripe;
} 