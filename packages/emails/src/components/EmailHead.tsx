/* eslint-disable @next/next/no-head-element */
import RawHtml from "./RawHtml";

const EmailHead = ({ title = "" }) => {
  return (
    <head>
      <title>{title}</title>
      <RawHtml
        html={`<!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->`}
      />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Lets mail apps that follow the reader's light/dark setting (Apple Mail, Outlook for Mac/iOS) use the
          dark styles below; others keep the light version. */}
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      {/* Raw so the quotes in the attribute selectors aren't HTML-escaped. */}
      <RawHtml html={`<style type="text/css">
          @media (prefers-color-scheme: dark) {
            body, [style*="background-color:#F3F4F6"], [style*="background-color:#f3f4f6"] {
              background: #0b0b0c !important;
              background-color: #0b0b0c !important;
            }
            [style*="background-color:#FFFFFF"], [style*="background:#FFFFFF"],
            [style*="background-color:#ffffff"], [style*="background:#ffffff"],
            [style*="background-color:#fff;"], [style*="background:#fff;"], [bgcolor="#FFFFFF"] {
              background: #161617 !important;
              background-color: #161617 !important;
            }
            [style*="background:#f9fafb"], [style*="background-color:#f9fafb"] {
              background: #1f1f21 !important;
              background-color: #1f1f21 !important;
            }
            [style*="border"], hr {
              border-color: #2e2e31 !important;
            }
            body, p, td, div, span, h1, h2, h3, li, strong {
              color: #e8e8ea !important;
            }
            a {
              color: #93c5fd !important;
            }
            .sw-logo-light { display: none !important; }
            .sw-logo-dark { display: block !important; }
          }
        </style>`} />
      <style type="text/css">
        {`
          #outlook a {
            padding: 0;
          }

          body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }

          table,
          td {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }

          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }

          p {
            display: block;
            margin: 13px 0;
          }
        `}
      </style>
      <RawHtml html="<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->" />
      <RawHtml
        html={`<!--[if lte mso 11]><style type="text/css">.mj-outlook-group-fix { width:100% !important; }</style><![endif]-->`}
      />
      <RawHtml
        html={`<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700" rel="stylesheet" type="text/css"/>
      <style type="text/css">@import url(https://fonts.googleapis.com/css?family=Roboto:400,500,700);</style><!--<![endif]-->`}
      />
      <style type="text/css">
        {`
          @media only screen and (min-width: 480px) {
            .mj-column-per-100 {
              width: 100% !important;
              max-width: 100%;
            }
          }
        `}
      </style>
      <style media="screen and (min-width:480px)">
        {`
          .moz-text-html .mj-column-per-100 {
            width: 100% !important;
            max-width: 100%;
          }
        `}
      </style>
      <style type="text/css">
        {`
          @media only screen and (max-width: 480px) {
            table.mj-full-width-mobile {
              width: 100% !important;
            }

            td.mj-full-width-mobile {
              width: auto !important;
            }
          }
        `}
      </style>
    </head>
  );
};

export default EmailHead;
