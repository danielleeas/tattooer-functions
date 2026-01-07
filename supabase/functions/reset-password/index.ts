// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2";

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  // Minimum length check
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }

  // Maximum length check (reasonable limit)
  if (password.length > 128) {
    return { valid: false, error: "Password must be no more than 128 characters long" };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: "Password must contain at least one special character" };
  }

  return { valid: true };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method Not Allowed" } as ResetPasswordResult),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });

  try {
    const body = await req.json();
    const email = (body.email || "").trim();
    const user_id = body.user_id?.trim();
    const new_password = (body.new_password || "").trim();

    if (!new_password) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: new_password" } as ResetPasswordResult),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return new Response(
        JSON.stringify({ success: false, error: passwordValidation.error } as ResetPasswordResult),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!email && !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: email or user_id" } as ResetPasswordResult),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the user by email or user_id
    let userId: string | null = null;
    
    if (user_id) {
      // Verify user exists by ID
      const userResponse = await supabase.auth.admin.getUserById(user_id);
      if (userResponse.error || !userResponse.data.user) {
        return new Response(
          JSON.stringify({ success: false, error: userResponse.error?.message || "User not found" } as ResetPasswordResult),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      userId = user_id;
    } else if (email) {
      // Search for user by email
      let page = 1;
      const perPage = 1000;
      while (true) {
        const list = await supabase.auth.admin.listUsers({ page, perPage });
        if (list.error) {
          return new Response(
            JSON.stringify({ success: false, error: list.error.message } as ResetPasswordResult),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
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
      return new Response(
        JSON.stringify({ success: false, error: "User not found" } as ResetPasswordResult),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update password directly
    const updateResponse = await supabase.auth.admin.updateUserById(
      userId,
      { password: new_password }
    );

    if (updateResponse.error) {
      return new Response(
        JSON.stringify({ success: false, error: updateResponse.error.message } as ResetPasswordResult),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data: ResetPasswordResult = {
      success: true,
      message: "Password updated successfully",
    };

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("reset-password error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "Unexpected error" } as ResetPasswordResult),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reset-password' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"email":"artist@example.com","new_password":"newSecurePassword123"}'

*/
