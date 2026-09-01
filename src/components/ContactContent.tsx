export default function ContactContent() {
  return (
    <div className="wrap py-16 max-w-xl mx-auto">
      <h1 className="font-display text-4xl text-center">Contact</h1>
      <form className="mt-10 space-y-5">
        <p className="font-display text-xl">Contact form</p>
        <div>
          <label htmlFor="contact-name" className="block text-[13px] tracking-[0.08em] mb-1.5">Name</label>
          <input id="contact-name" type="text" autoComplete="name" className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-[13px] tracking-[0.08em] mb-1.5">Email *</label>
          <input id="contact-email" type="email" autoComplete="email" required className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-[13px] tracking-[0.08em] mb-1.5">Phone number</label>
          <input id="contact-phone" type="tel" autoComplete="tel" className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <div>
          <label htmlFor="contact-comment" className="block text-[13px] tracking-[0.08em] mb-1.5">Comment</label>
          <textarea id="contact-comment" rows={5} className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
        </div>
        <button type="submit" className="btn !bg-ink !border-ink">Send</button>
      </form>
    </div>
  );
}
