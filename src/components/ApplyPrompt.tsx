import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { apply } from "../content";
import { curtainGone } from "../lib/anim";
import { track } from "../lib/analytics";

const SEEN = "off-apply-prompt";

/* =============================================================================
 * LOAD PROMPT — native <dialog> after the Stairs curtain. Once per tab
 * session; skipped on /apply. Copy: `apply.prompt` in content.ts.
 * ========================================================================== */
export default function ApplyPrompt() {
  const dialog = useRef<HTMLDialogElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/apply") {
      sessionStorage.setItem(SEEN, "1");
      return;
    }
    if (sessionStorage.getItem(SEEN)) return;

    let cancelled = false;
    curtainGone.then(() => {
      if (!cancelled) dialog.current?.showModal();
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const dismiss = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      aria-labelledby="apply-prompt-title"
      onClose={() => sessionStorage.setItem(SEEN, "1")}
      onClick={(e) => {
        const box = dialog.current?.getBoundingClientRect();
        if (!box) return;
        const outside =
          e.clientX < box.left ||
          e.clientX > box.right ||
          e.clientY < box.top ||
          e.clientY > box.bottom;
        if (outside) dismiss();
      }}
      className="dither-weak relative m-auto w-[min(28rem,calc(100vw-3rem))] border border-white bg-scarlet p-8 text-white backdrop:bg-gray-dark-40/60"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={apply.prompt.dismiss}
        className="absolute top-4 right-4 grid size-8 place-items-center text-white transition-opacity duration-200 hover:opacity-80"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          aria-hidden
        >
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <h2
        id="apply-prompt-title"
        className="text-heading pr-8 font-semibold"
      >
        {apply.prompt.headline}
      </h2>
      <Link
        to="/apply"
        autoFocus
        onClick={() => {
          track("apply_clicked", { where: "prompt" });
          dismiss();
        }}
        className="label text-label-s mt-8 block w-full bg-white py-4 text-center text-scarlet transition-opacity duration-200 hover:opacity-80"
      >
        {apply.cta}
      </Link>
    </dialog>
  );
}
