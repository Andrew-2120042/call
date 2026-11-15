// next-themes renders an inline <script> that sets the theme before first paint. It must stay executable in
// the server HTML, but React warns whenever a client render creates a script tag (on client-side navigation).
// Scripts created by React on the client never run anyway, so the client copy is marked as a data block.
export const themeScriptProps =
  typeof window === "undefined" ? undefined : ({ type: "application/json" } as const);
