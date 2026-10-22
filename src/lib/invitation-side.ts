/** Phân biệt nguồn thiệp độc lập với giao diện và các ảnh dùng chung. */
export type InvitationSide = 'groom' | 'bride';
export type StoredSide = InvitationSide | 'legacy';
export type SideFilter = 'all' | StoredSide;
export const sideLabels: Record<StoredSide, string> = {
  groom: 'Nhà trai', bride: 'Nhà gái', legacy: 'Chưa phân loại',
};
export function isInvitationSide(value: unknown): value is InvitationSide {
  return value === 'groom' || value === 'bride';
}
export function getInitialInvitationSide(): InvitationSide | null {
  if (typeof window === 'undefined') return null;
  const side = new URLSearchParams(window.location.search).get('side');
  return isInvitationSide(side) ? side : null;
}
export function setInvitationUrlSide(side: InvitationSide): void {
  const url = new URL(window.location.href);
  url.searchParams.set('side', side);
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
}
