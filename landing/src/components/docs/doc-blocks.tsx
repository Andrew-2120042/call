import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { type DocBlock, docSlug } from "@/content/docs";

/** Renders the small inline markup the docs use: **bold**, *italic*, `code` and [links](href). */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const [, bold, italic, code, label, href] = match;
    if (bold) parts.push(<strong key={match.index} className="text-fg font-medium">{bold}</strong>);
    else if (italic) parts.push(<em key={match.index}>{italic}</em>);
    else if (code)
      parts.push(
        <code key={match.index} className="rounded border border-line bg-surface px-1 py-px font-mono text-[0.92em] text-fg">
          {code}
        </code>
      );
    else if (label && href)
      parts.push(
        href.startsWith("/") ? (
          <Link key={match.index} href={href} className="text-fg underline decoration-line-strong underline-offset-[3px] hover:decoration-fg">
            {label}
          </Link>
        ) : (
          <a key={match.index} href={href} className="text-fg underline decoration-line-strong underline-offset-[3px] hover:decoration-fg">
            {label}
          </a>
        )
      );
    last = match.index + match[0].length;
    match = pattern.exec(text);
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

export function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="text-muted text-[13px] leading-[1.7]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return <p key={i} className="mt-3"><Inline text={block.text} /></p>;
          case "h2":
            return (
              <h2 key={i} id={docSlug(block.text)} className="font-sans text-fg mt-9 scroll-mt-6 text-sm font-semibold">
                {block.text}
              </h2>
            );
          case "h3":
            return <h3 key={i} className="font-sans text-fg mt-6 text-[13px] font-medium">{block.text}</h3>;
          case "steps":
            return (
              <ol key={i} className="mt-3 list-decimal space-y-1.5 ps-5 marker:text-faint">
                {block.items.map((item) => <li key={item} className="ps-1"><Inline text={item} /></li>)}
              </ol>
            );
          case "list":
            return (
              <ul key={i} className="mt-3 list-disc space-y-1.5 ps-5 marker:text-line-strong">
                {block.items.map((item) => <li key={item} className="ps-1"><Inline text={item} /></li>)}
              </ul>
            );
          case "table":
            return (
              <div key={i} className="mt-4 overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-left text-xs">
                  <thead className="text-faint bg-surface">
                    <tr>{block.head.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {block.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((cell, c) => (
                          <td key={cell} className={`px-3 py-2 align-top ${c === 0 ? "text-fg whitespace-nowrap font-medium" : ""}`}>
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "code":
            return (
              <pre key={i} className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-[11.5px] leading-relaxed text-fg/90">
                <code>{block.text}</code>
              </pre>
            );
          case "note":
            return (
              <p key={i} className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-xs">
                <Inline text={block.text} />
              </p>
            );
          case "image":
            return (
              <figure key={i} className="mt-5">
                <div className="overflow-hidden rounded-lg border border-line bg-surface">
                  <Image src={block.src} alt={block.alt} width={2560} height={1600} sizes="(min-width: 1024px) 680px, 100vw" quality={85} className="h-auto w-full" />
                </div>
                {block.caption && <figcaption className="text-faint mt-2 text-center text-[11px]">{block.caption}</figcaption>}
              </figure>
            );
          case "changes":
            return (
              <ol key={i} className="mt-2 border-s border-line">
                {block.items.map((c) => (
                  <li key={c.title} className="relative ps-5 pb-6">
                    <span className="bg-line-strong absolute -start-[3.5px] top-1.5 h-1.5 w-1.5 rounded-full" />
                    <p className="text-faint text-[11px]">{c.date}</p>
                    <p className="text-fg mt-0.5 text-[13px] font-medium">{c.title}</p>
                    <p className="mt-0.5">{c.body}</p>
                  </li>
                ))}
              </ol>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
