// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2";

export interface CreateClientResult {
  success: boolean;
  client?: any;
  authUserId?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method Not Allowed" } as CreateClientResult), { status: 405 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY,{
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });

  try {
    const body = await req.json();
    const full_name = (body.full_name || "").trim();
    const email = (body.email || "").trim();
    const phone_number = (body.phone_number || "").trim();
    const location = (body.location || "").trim();
    const project_notes = body.project_notes?.toString() ?? null;
    const artist_id = (body.artist_id || "").trim();

    if (!full_name || !email || !phone_number || !artist_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" } as CreateClientResult), { status: 400 });
    }

    // 1) Get or create auth user
    let userId: string | null = null;
    {
      let page = 1;
      const perPage = 1000;
      while (true) {
        const list = await supabase.auth.admin.listUsers({ page, perPage });
        if (list.error) break;
        const match = list.data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
        if (match) {
          userId = match.id;
          break;
        }
        if (list.data.users.length < perPage) break;
        page++;
      }
    }

    if (!userId) {
      const createRes = await supabase.auth.admin.createUser({
        email,
        password: email,
        user_metadata: { full_name, phone_number, location },
      });
      if (createRes.error || !createRes.data.user) {
        return new Response(JSON.stringify({ success: false, error: createRes.error?.message || "Failed to create auth user" } as CreateClientResult), { status: 400 });
      }
      userId = createRes.data.user.id;
    }

    // 2) Insert/upsert into clients with id = auth user id
    // If your DB still enforces NOT NULL on location, use '' as default or relax the constraint.
    const insertRes = await supabase
      .from("clients")
      .upsert(
        {
          id: userId,
          full_name,
          email,
          phone_number,
          location,
          project_notes,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (insertRes.error) {
      return new Response(JSON.stringify({ success: false, error: insertRes.error.message } as CreateClientResult), { status: 400 });
    }

    const linkInsertRes = await supabase
      .from("links")
      .upsert(
        {
          client_id: userId,
          artist_id: artist_id,
          status: "pending",
        },
        { onConflict: "client_id,artist_id" }
      )
      .select()
      .single();

    if (linkInsertRes.error) {
      return new Response(JSON.stringify({ success: false, error: linkInsertRes.error.message } as CreateClientResult), { status: 400 });
    }

    const data: CreateClientResult = {
      success: true,
      client: { ...insertRes.data, status: linkInsertRes.data?.status },
      authUserId: userId,
    };
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (e) {
    console.error("create-client error:", e);
    return new Response(JSON.stringify({ success: false, error: e?.message || "Unexpected error" } as CreateClientResult), { status: 500 });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-client' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
