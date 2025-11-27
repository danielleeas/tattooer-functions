// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend";
import { render } from "npm:@react-email/render";
import ClientNew from "./client-new.tsx";
import React from "npm:react";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}
const resend = new Resend(RESEND_API_KEY);
Deno.serve(async (req)=>{
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({
        error: "Content-Type must be application/json"
      }), {
        status: 415,
        headers: { "Content-Type": "application/json" }
      });
    }

    let payload;
    try {
      payload = await req.json();
    } catch (_e) {
      return new Response(JSON.stringify({
        error: "Invalid JSON body"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { to, email_templates, avatar_url, variables, action_links } = payload || {};
    // ✅ Validate required fields
    if (
      (!to) ||
      (!email_templates || typeof email_templates.subject !== "string" || typeof email_templates.body !== "string") ||
      (!avatar_url || typeof avatar_url !== "string") ||
      (!variables || typeof variables !== "object") ||
      (!action_links || typeof action_links !== "object")
    ) {
      return new Response(JSON.stringify({
        error: "Missing or invalid fields. Expected { to, email_templates{subject,body}, avatar_url, variables, action_links }"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    // ✅ Render React email component to HTML
    const html = await render(React.createElement(ClientNew, {
      email_templates,
      avatar_url,
      variables,
      action_links
    }));
    // ✅ Send email via Resend
    const data = await resend.emails.send({
      from: "noreply@simpletattooer.com",
      to,
      subject: email_templates.subject,
      html
    });
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      error: error.message || "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
