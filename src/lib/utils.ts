export function getGuestName(): string {
  const search = new URLSearchParams(window.location.search);
  // VD: ?to=Nguyen%20Van%20A ; giới hạn dài để tránh chèn rác vào giao diện.
  return (search.get('to') ?? '').trim().slice(0, 70);
}
export function buildCalendarUrl(name: string, dateISO: string) {
  const start = new Date(dateISO);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const p = new URLSearchParams({ action: 'TEMPLATE', text: `Lễ cưới ${name}`, dates: `${format(start)}/${format(end)}`, details: 'Mong được đón tiếp bạn trong ngày vui của chúng mình!' });
  return `https://calendar.google.com/calendar/render?${p}`;
}
export function countdownParts(target: string) {
  const millis = Math.max(0, new Date(target).getTime() - Date.now());
  const seconds = Math.floor(millis / 1000);
  return { days: Math.floor(seconds / 86400), hours: Math.floor((seconds % 86400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60, ended: millis <= 0 };
}
export function withLeadingZero(num: number) { return num.toString().padStart(2, '0'); }
export function clampIndex(index: number, length: number) { return (index + length) % length; }
