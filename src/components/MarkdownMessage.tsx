import React from 'react';

interface MarkdownMessageProps {
  text: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(md: string): string {
  // Inline code
  let out = md.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100 border border-gray-200">$1</code>');
  // Bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}

function renderBlock(segment: string, isCode: boolean): string {
  if (isCode) {
    return `<pre class="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto"><code>${escapeHtml(segment)}</code></pre>`;
  }

  const lines = segment.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inUl = false;
  let inOl = false;

  const flushLists = () => {
    if (inUl) { htmlParts.push('</ul>'); inUl = false; }
    if (inOl) { htmlParts.push('</ol>'); inOl = false; }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushLists();
      continue;
    }
    // Headings
    if (trimmed.startsWith('### ')) {
      flushLists();
      htmlParts.push(`<h4 class="font-semibold text-gray-900 mt-3 mb-2">${renderInline(escapeHtml(trimmed.slice(4)))}</h4>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushLists();
      htmlParts.push(`<h3 class="font-semibold text-gray-900 mt-3 mb-2">${renderInline(escapeHtml(trimmed.slice(3)))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushLists();
      htmlParts.push(`<h2 class="font-semibold text-gray-900 mt-3 mb-2">${renderInline(escapeHtml(trimmed.slice(2)))}</h2>`);
      continue;
    }
    // List item
    if (trimmed.startsWith('- ')) {
      if (!inUl) { flushLists(); inUl = true; htmlParts.push('<ul class="list-disc pl-6 space-y-1">'); }
      htmlParts.push(`<li>${renderInline(escapeHtml(trimmed.slice(2)))}</li>`);
      continue;
    }
    // Ordered list item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!inOl) { flushLists(); inOl = true; htmlParts.push('<ol class="list-decimal pl-6 space-y-1">'); }
      htmlParts.push(`<li>${renderInline(escapeHtml(olMatch[2]))}</li>`);
      continue;
    }
    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushLists();
      htmlParts.push(`<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">${renderInline(escapeHtml(trimmed.slice(2)))}</blockquote>`);
      continue;
    }
    // Horizontal rule
    if (trimmed === '---') {
      flushLists();
      htmlParts.push('<hr class="my-3 border-gray-200" />');
      continue;
    }
    // Paragraph
    flushLists();
    htmlParts.push(`<p class="leading-7 text-gray-800">${renderInline(escapeHtml(line))}</p>`);
  }

  flushLists();
  return htmlParts.join('');
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ text }) => {
  // Split by fenced code blocks ```
  const parts = text.split(/```/g);
  const html = parts
    .map((part, idx) => renderBlock(part, idx % 2 === 1))
    .join('');
  return (
    <div className="max-w-none space-y-2 break-words">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default MarkdownMessage;


