// Renders admin-authored rich text (HTML) safely wrapped, avoiding inline JSX object literals.
export default function RichHtml({ html, className = 'prose-content' }) {
  const markup = { __html: html || '' }
  return <div className={className} dangerouslySetInnerHTML={markup} />
}
