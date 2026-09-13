"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

export default function ContactContent() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          comment: data.get("comment"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("ok");
        setMessage("Thank you — your message has been sent. We'll be in touch soon.");
        form.reset();
      } else {
        setStatus("error");
        setMessage(json.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="wrap py-16 max-w-xl mx-auto">
      <h1 className="font-display text-4xl text-center">Contact</h1>
      <form className="mt-10 space-y-5" onSubmit={onSubmit} noValidate>
        <p className="font-display text-xl">Contact form</p>
        <div>
          <label htmlFor="contact-name" className="block text-[13px] tracking-[0.08em] mb-1.5">Name</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-[13px] tracking-[0.08em] mb-1.5">Email *</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-[13px] tracking-[0.08em] mb-1.5">Phone number</label>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <div>
          <label htmlFor="contact-comment" className="block text-[13px] tracking-[0.08em] mb-1.5">Comment *</label>
          <textarea id="contact-comment" name="comment" rows={5} required className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <button type="submit" disabled={status === "sending"} className="btn !bg-ink !border-ink disabled:opacity-60 disabled:cursor-not-allowed">
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        {message && (
          <p role="status" className={`text-sm ${status === "ok" ? "text-[#065f46]" : "text-[#b91c1c]"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
