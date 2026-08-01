/**
 * Subscribe field — bordered box plus a solid square submit. Used by the hero
 * and the footer, so the two never drift apart. Posts nowhere yet.
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

  return (
    <form className={className} onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-stretch">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          required
          placeholder="Your email…"
          aria-describedby={hintId}
          className={`text-body-s min-w-0 flex-1 border-1 border-white ${inputFill} px-4 py-3 font-bold text-white outline-none transition-colors placeholder:font-bold placeholder:text-white placeholder:opacity-100 focus-visible:border-white`}
        />
        <button
          type="submit"
          aria-label="Subscribe to the newsletter"
          className="grid aspect-square w-12 shrink-0 place-items-center bg-white text-scarlet transition-opacity duration-200 hover:opacity-80"
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

      <p id={hintId} className="label text-label-s mt-3 text-white">
        {hint}
      </p>
    </form>
  );
}
