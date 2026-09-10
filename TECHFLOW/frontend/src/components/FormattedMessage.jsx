import React from 'react';
import { Table, Mail } from 'lucide-react';

/**
 * Parses markdown tables into structured headers and rows
 */
function parseMarkdownTable(tableText) {
  const lines = tableText.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  // Header row
  const headerLine = lines[0];
  if (!headerLine.includes('|')) return null;
  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter((h, idx, arr) => (idx > 0 && idx < arr.length - 1) || (idx === 0 && h) || (idx === arr.length - 1 && h));

  // Separator line (e.g. | :--- | :--- |)
  let startIndex = 1;
  if (lines.length > 1 && lines[1].includes('---')) {
    startIndex = 2;
  }

  // Row data
  const rows = [];
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('|')) continue;
    const cells = line
      .split('|')
      .map(c => c.trim())
      .filter((c, idx, arr) => (idx > 0 && idx < arr.length - 1) || (idx === 0 && c) || (idx === arr.length - 1 && c));
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return { headers, rows };
}

/**
 * Formats individual table cell content (status badges, emails, IDs, etc.)
 */
function renderCellContent(cellText) {
  if (!cellText) return <span className="text-gray-400 italic">N/A</span>;

  const trimmed = cellText.trim();
  const lower = trimmed.toLowerCase();

  // Status badges
  if (lower === 'active' || lower === 'completed' || lower === 'success' || lower === 'enabled') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {trimmed}
      </span>
    );
  }
  if (lower === 'inactive' || lower === 'failed' || lower === 'disabled' || lower === 'blocked') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        {trimmed}
      </span>
    );
  }
  if (lower === 'pending' || lower === 'in progress' || lower === 'review') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {trimmed}
      </span>
    );
  }

  // Email format
  if (trimmed.includes('@') && !trimmed.includes(' ')) {
    return (
      <a
        href={`mailto:${trimmed}`}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        <Mail className="w-3 h-3 text-blue-500" />
        <span>{trimmed}</span>
      </a>
    );
  }

  // ID tags (e.g. C001, EMP-102, #390)
  if (/^[A-Za-z0-9_-]{3,10}$/.test(trimmed) && (trimmed.startsWith('C') || trimmed.startsWith('ID') || trimmed.startsWith('EMP') || /^\d+$/.test(trimmed))) {
    return (
      <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-semibold">
        {trimmed}
      </span>
    );
  }

  return <span>{trimmed}</span>;
}

/**
 * Parses a block of text into structured markdown segments (tables, headers, lists, paragraphs)
 */
export default function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks = [];
  let currentTableLines = [];
  let currentTextLines = [];

  const flushText = () => {
    if (currentTextLines.length > 0) {
      blocks.push({ type: 'text', content: currentTextLines.join('\n') });
      currentTextLines = [];
    }
  };

  const flushTable = () => {
    if (currentTableLines.length > 0) {
      const parsed = parseMarkdownTable(currentTableLines.join('\n'));
      if (parsed && parsed.headers.length > 0) {
        blocks.push({ type: 'table', data: parsed });
      } else {
        blocks.push({ type: 'text', content: currentTableLines.join('\n') });
      }
      currentTableLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      flushText();
      currentTableLines.push(line);
    } else {
      flushTable();
      currentTextLines.push(lines[i]);
    }
  }
  flushText();
  flushTable();

  return (
    <div className="space-y-3 text-gray-800">
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          const { headers, rows } = block.data;
          return (
            <div key={bIdx} className="my-2.5 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* Table header bar */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <Table className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Sheets Records</span>
                </div>
                <span className="rounded bg-gray-200/80 px-2 py-0.5 text-[11px] font-mono text-gray-600">
                  {rows.length} {rows.length === 1 ? 'row' : 'rows'}
                </span>
              </div>

              {/* Responsive table container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100/70">
                      {headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-3.5 py-2.5 font-semibold uppercase tracking-wider text-gray-600 text-[11px]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="transition-colors hover:bg-blue-50/40 odd:bg-white even:bg-gray-50/50"
                      >
                        {headers.map((_, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2.5 text-gray-800">
                            {renderCellContent(row[cIdx] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        // Render formatted text lines
        const textContent = block.content.trim();
        if (!textContent) return null;

        return (
          <div key={bIdx} className="space-y-1.5 leading-relaxed text-sm">
            {textContent.split('\n').map((paragraph, pIdx) => {
              const p = paragraph.trim();
              if (!p) return <div key={pIdx} className="h-1" />;

              if (p.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="font-semibold text-gray-900 text-sm mt-2 mb-1">
                    {p.replace('### ', '')}
                  </h4>
                );
              }
              if (p.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="font-bold text-gray-900 text-base mt-2 mb-1">
                    {p.replace('## ', '')}
                  </h3>
                );
              }
              if (p.startsWith('# ')) {
                return (
                  <h2 key={pIdx} className="font-bold text-gray-900 text-lg mt-3 mb-1">
                    {p.replace('# ', '')}
                  </h2>
                );
              }

              if (p.startsWith('- ') || p.startsWith('* ')) {
                return (
                  <div key={pIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{renderInlineMarkdown(p.substring(2))}</span>
                  </div>
                );
              }

              return (
                <p key={pIdx} className="text-gray-800 leading-normal">
                  {renderInlineMarkdown(p)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInlineMarkdown(str) {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-blue-700 border border-gray-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
