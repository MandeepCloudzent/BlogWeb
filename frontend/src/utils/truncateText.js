export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '…';
}
