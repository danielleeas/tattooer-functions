// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend";
import { render } from "npm:@react-email/render";
import ArtistNew from "./welcome.tsx";
import React from "npm:react";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set in environment variables");
}
const resend = new Resend(RESEND_API_KEY);
Deno.serve(async (req)=>{
  try {
    const { to, artistName, artistBookingLink } = await req.json();
    // ✅ Validate required fields
    if (!to || !artistName || !artistBookingLink) {
      return new Response(JSON.stringify({
        error: "Missing 'to' or 'artistName' or 'artistBookingLink' field"
      }), {
        status: 400
      });
    }
    // ✅ Render React email component to HTML
    const html = await render(React.createElement(ArtistNew, {
      artistName,
      artistBookingLink
    }));
    // ✅ Send email via Resend
    const data = await resend.emails.send({
      from: "noreply@simpletattooer.com",
      to,
      subject: 'Welcome to Simple Tattooer!',
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
      status: 500
    });
  }
});
