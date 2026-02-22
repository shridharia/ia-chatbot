"use client";

interface Source {
  url: string;
  title: string | null;
}

export function SourcesSection({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;

  const unique = Array.from(
    new Map(sources.map((s) => [s.url, s])).values()
  );

  return (
    <div className="mt-3 border-t border-[#2563eb]/20 pt-3">
      <div className="flex items-center gap-2 text-xs font-medium text-[#2563eb]">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        Sources
      </div>
      <ul className="mt-2 space-y-1">
        {unique.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#2563eb] hover:underline"
            >
              {s.title || s.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
