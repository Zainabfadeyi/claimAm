import { useRouter } from "next/router";

// A "back" link that actually goes back (wherever the user came from — /finder with
// their results, or /programs) instead of a hardcoded destination. Falls back to
// fallbackHref when there's no in-app history to return to (e.g. a direct link/refresh).
export default function BackLink({ fallbackHref, children, className }) {
  const router = useRouter();

  function handleClick(e) {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <a href={fallbackHref} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
