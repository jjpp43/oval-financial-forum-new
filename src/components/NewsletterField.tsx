import { useState } from "react";

/**
 * Subscribe field — bordered box plus a solid square submit. Used by the hero
 * and the footer, so the two never drift apart. Posts to /api/subscribe, which
 * adds the address to the Brevo list (see api/subscribe.ts).
 */
export default function NewsletterField({
  id,
  hint,
  className = "",
  inputFill = "bg-transparent",
}: {
  /** unique per instance — the hero and footer are both mounted at once */
  id: string;
  hint: string;
  className?: string;
  /** field fill — the hero tints it so the box reads against the dithered photo */
  inputFill?: string;
}) {
  const hintId = `${id}-hint`;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.ok) {
        setState("done");
        setEmail("");
      } else {
        setError(data.error ?? "Could not subscribe right now");
        setState("error");
      }
    } catch {
      setError("Could not reach the server");
      setState("error");
    }
  };

  return (
    <form className={className} onSubmit={submit}>
      <div className="flex items-stretch">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          disabled={state === "sending"}
          placeholder="Your email…"
          aria-describedby={hintId}
          className={`text-body-s min-w-0 flex-1 border-1 border-white ${inputFill} px-4 py-3 font-bold text-white outline-none transition-colors placeholder:font-bold placeholder:text-white placeholder:opacity-100 focus-visible:border-white`}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          aria-label="Subscribe to the newsletter"
          className="grid aspect-square w-12 shrink-0 place-items-center bg-white text-scarlet transition-opacity duration-200 hover:opacity-80 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M7 17L17 7M17 7H8M17 7v9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* the hint doubles as the status line, so the box never shifts height */}
      <p id={hintId} aria-live="polite" className="label text-label-s mt-3 text-white">
        {state === "done"
          ? "You are on the list — thanks."
          : state === "error"
            ? error
            : hint}
      </p>
    </form>
  );
}
