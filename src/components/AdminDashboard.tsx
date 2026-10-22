import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Check, X, Mail, Users, Search, Download, Copy, Trash2,
  RefreshCw, Lock, ArrowLeft, AlertCircle, CheckCircle2,
  EyeOff, CheckCheck, ShieldCheck, LogOut
} from 'lucide-react';
import { wedding } from '../wedding.config';
import { sideLabels, type SideFilter } from '../lib/invitation-side';
import {
  adminLogin, fetchAdminData, updateWishStatus, approveAllWishes,
  deleteWish, deleteRSVP, type AdminWish, type AdminRSVP, type AdminStats
} from '../lib/api';

const SAVED_PIN_KEY = 'wedding_admin_saved_pin';

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [pin, setPin] = useState(() => localStorage.getItem(SAVED_PIN_KEY) || '');
  const [rememberPin, setRememberPin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [wishes, setWishes] = useState<AdminWish[]>([]);
  const [rsvps, setRsvps] = useState<AdminRSVP[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  const [activeTab, setActiveTab] = useState<'wishes' | 'rsvps'>('wishes');
  const [sideFilter, setSideFilter] = useState<SideFilter>('all');
  const [wishFilter, setWishFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('pending');
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpStatusFilter, setRsvpStatusFilter] = useState<'all' | 'attending' | 'declined'>('all');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async (activePin: string, isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetchAdminData(activePin);
      if (res.ok) {
        setStats(res.stats);
        setWishes(res.wishes);
        setRsvps(res.rsvps);
        setIsDemo(Boolean(res.demo));
      } else if (res.error) {
        showToast(res.error, 'error');
      }
    } catch {
      showToast('Không thể tải dữ liệu mới nhất.', 'error');
    } finally {
      if (!isSilent) setRefreshing(false);
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pin.trim();
    if (!cleanPin) {
      setLoginError('Vui lòng nhập mã PIN quản trị.');
      return;
    }
    setLoading(true);
    setLoginError(null);
    try {
      const res = await adminLogin(cleanPin);
      if (res.ok) {
        setIsLoggedIn(true);
        if (rememberPin) {
          localStorage.setItem(SAVED_PIN_KEY, cleanPin);
        } else {
          localStorage.removeItem(SAVED_PIN_KEY);
        }
        await loadData(cleanPin, false);
      } else {
        setLoginError(res.error || 'Mã PIN không chính xác.');
      }
    } catch {
      setLoginError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Tự động đăng nhập nếu đã lưu PIN
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_PIN_KEY);
    if (saved && saved.length >= 4) {
      void handleLogin();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(SAVED_PIN_KEY);
    setPin('');
    setIsLoggedIn(false);
    setStats(null);
    setWishes([]);
    setRsvps([]);
  };

  // Xử lý Lời chúc
  const handleUpdateWishStatus = async (id: number, status: 'approved' | 'hidden' | 'pending') => {
    const res = await updateWishStatus(pin, id, status);
    if (res.ok) {
      setWishes(prev => prev.map(w => w.id === id ? { ...w, status } : w));
      void loadData(pin, true);
      showToast(status === 'approved' ? 'Đã duyệt lời chúc!' : 'Đã chuyển trạng thái lời chúc.');
    } else {
      showToast(res.error || 'Không thể cập nhật.', 'error');
    }
  };

  const handleApproveAll = async () => {
    if (!window.confirm(`Duyệt tất cả lời chúc đang chờ của ${sideFilter === 'all' ? 'cả hai bên' : sideLabels[sideFilter]}?`)) return;
    const res = await approveAllWishes(pin, sideFilter);
    if (res.ok) {
      setWishes(prev => prev.map(w => w.status === 'pending' && (sideFilter === 'all' || (w.side || 'legacy') === sideFilter) ? { ...w, status: 'approved' } : w));
      void loadData(pin, true);
      showToast('Đã duyệt tất cả lời chúc đang chờ!');
    } else {
      showToast(res.error || 'Thao tác không thành công.', 'error');
    }
  };

  const handleDeleteWish = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn XÓA hẳn lời chúc này khỏi cơ sở dữ liệu?')) return;
    const res = await deleteWish(pin, id);
    if (res.ok) {
      setWishes(prev => prev.filter(w => w.id !== id));
      void loadData(pin, true);
      showToast('Đã xóa lời chúc.');
    } else {
      showToast(res.error || 'Không thể xóa lời chúc.', 'error');
    }
  };

  // Xử lý RSVP
  const handleDeleteRSVP = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa lượt phản hồi RSVP này?')) return;
    const res = await deleteRSVP(pin, id);
    if (res.ok) {
      setRsvps(prev => prev.filter(r => r.id !== id));
      void loadData(pin, true);
      showToast('Đã xóa phản hồi.');
    } else {
      showToast(res.error || 'Không thể xóa phản hồi.', 'error');
    }
  };

  // Lọc theo từng nhà cho CẢ hai bảng, không đổi trạng thái gốc trên server.
  const sideWishes = useMemo(() => wishes.filter(w => sideFilter === 'all' || (w.side || 'legacy') === sideFilter), [wishes, sideFilter]);
  const sideRsvps = useMemo(() => rsvps.filter(r => sideFilter === 'all' || (r.side || 'legacy') === sideFilter), [rsvps, sideFilter]);
  const filteredWishes = useMemo(() => sideWishes.filter(w => wishFilter === 'all' || (w.status || 'pending') === wishFilter), [sideWishes, wishFilter]);
  const filteredRsvps = useMemo(() => sideRsvps.filter(r => {
    const isAttending = r.attending === 1 || r.attending === true;
    if (rsvpStatusFilter === 'attending' && !isAttending) return false;
    if (rsvpStatusFilter === 'declined' && isAttending) return false;
    const q = rsvpSearch.trim().toLowerCase();
    return !q || r.guest_name.toLowerCase().includes(q) || (r.note || '').toLowerCase().includes(q);
  }), [sideRsvps, rsvpStatusFilter, rsvpSearch]);
  const pendingCount = sideWishes.filter(w => w.status === 'pending').length;
  const sideAttending = sideRsvps.filter(r=>r.attending === 1 || r.attending === true);
  const sideDeclined = sideRsvps.length - sideAttending.length;

  // Xuất file CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Họ và tên khách', 'Bên mời', 'Trạng thái', 'Số khách tham dự', 'Lời nhắn / Ghi chú', 'Thời gian gửi'];
    const rows = filteredRsvps.map((r, i) => {
      const isAttending = r.attending === 1 || r.attending === true;
      const statusText = isAttending ? 'Tham dự' : 'Báo vắng';
      const guestCount = isAttending ? String(r.guest_count) : '0';
      const note = (r.note || '').replace(/"/g, '""');
      const time = new Date(r.created_at).toLocaleString('vi-VN');
      return [
        i + 1,
        `"${r.guest_name.replace(/"/g, '""')}"`,
        `"${sideLabels[r.side || 'legacy']}"`,
        `"${statusText}"`,
        guestCount,
        `"${note}"`,
        `"${time}"`
      ].join(',');
    });

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danh-sach-khach-cuoi-${sideFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file CSV thành công!');
  };

  // Sao chép danh sách tóm tắt gửi Zalo/Chat
  const handleCopySummary = async () => {
    const attendingList = sideRsvps.filter(r => r.attending === 1 || r.attending === true);
    const declinedList = sideRsvps.filter(r => r.attending === 0 || r.attending === false);

    let text = `📋 DANH SÁCH ĐĂNG KÝ THAM DỰ HÔN LỄ — ${sideFilter === 'all' ? 'Tất cả' : sideLabels[sideFilter]}\n`;
    text += `👰 ${wedding.couple.bride} & 🤵 ${wedding.couple.groom}\n`;
    text += `Cập nhật lúc: ${new Date().toLocaleString('vi-VN')}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ TỔNG QUAN: ${attendingList.reduce((s, r) => s + (Number(r.guest_count) || 1), 0)} khách tham dự | ${declinedList.length} khách báo bận\n\n`;

    text += `✅ DANH SÁCH THAM DỰ (${attendingList.length} phản hồi):\n`;
    attendingList.forEach((r, idx) => {
      const noteText = r.note ? `\n   💬 Lời nhắn: "${r.note}"` : '';
      text += `${idx + 1}. ${r.guest_name} (${sideLabels[r.side || 'legacy']}) — ${r.guest_count} người${noteText}\n`;
    });

    if (declinedList.length > 0) {
      text += `\n❌ BÁO VẮNG (${declinedList.length} người):\n`;
      declinedList.forEach((r, idx) => {
        const noteText = r.note ? ` — "${r.note}"` : '';
        text += `${idx + 1}. ${r.guest_name} (${sideLabels[r.side || 'legacy']})${noteText}\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('Đã sao chép danh sách vào bộ nhớ tạm!');
    } catch {
      showToast('Không thể sao chép tự động.', 'error');
    }
  };

  // GIAO DIỆN ĐĂNG NHẬP (NẾU CHƯA ĐĂNG NHẬP)
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2b1f1d]/70 backdrop-blur-md">
        <div className="w-full max-w-md bg-[#faf7f0] border border-[#ddc8ba] rounded-2xl shadow-2xl p-6 sm:p-8 text-[#543b36]">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#967e73] hover:text-[#702b3a] transition-colors"
            >
              <ArrowLeft size={16} /> Quay lại thiệp cưới
            </button>
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#ecd5c8]/60 text-[#702b3a] rounded-full border border-[#ddc8ba]">
              Admin Portal
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 bg-[#f6eee4] border border-[#ddc8ba] rounded-full flex items-center justify-center text-[#702b3a]">
              <Lock size={26} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#702b3a]">Quản Trị Thiệp Cưới</h1>
            <p className="text-xs text-[#967e73] mt-1">
              Dành riêng cho {wedding.couple.groom} & {wedding.couple.bride} xem phản hồi và duyệt lời chúc
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-semibold uppercase tracking-wider text-[#967e73] mb-1.5">
                Nhập mã PIN bí mật
              </label>
              <input
                id="admin-pin"
                type="password"
                inputMode="numeric"
                autoFocus
                placeholder="Mã PIN quản trị"
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full px-4 py-3 text-center text-lg tracking-widest bg-white border border-[#ddc8ba] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#702b3a]/25 focus:border-[#702b3a]"
              />
              <p className="text-[11px] text-[#967e73] mt-1.5 text-center">
                Bản chạy thử local: nhập PIN bất kỳ từ 4 ký tự. Khi deploy, bắt buộc thiết lập secret <code className="bg-[#f6eee4] px-1 py-0.5 rounded font-mono">ADMIN_PIN</code> tối thiểu 6 ký tự.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-pin"
                checked={rememberPin}
                onChange={e => setRememberPin(e.target.checked)}
                className="rounded border-[#ddc8ba] text-[#702b3a] focus:ring-[#702b3a]"
              />
              <label htmlFor="remember-pin" className="text-xs text-[#543b36] cursor-pointer">
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#702b3a] hover:bg-[#5a222e] text-[#faf7f0] font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Đang xác thực...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Mở Bảng Quản Trị
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // GIAO DIỆN CHÍNH CỦA BẢNG QUẢN TRỊ
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#faf7f0] text-[#543b36] overflow-hidden">
      {/* Toast thông báo */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium border ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header thanh điều hướng */}
      <header className="shrink-0 bg-white border-b border-[#ddc8ba] px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-[#967e73] hover:text-[#702b3a] hover:bg-[#f6eee4] rounded-lg transition-colors"
              title="Đóng bảng quản trị"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-[#702b3a] leading-tight">
                  Quản Trị Thiệp Cưới
                </h1>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                    isDemo
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isDemo ? 'Local / Demo' : 'D1 Live'}
                </span>
              </div>
              <p className="text-xs text-[#967e73]">
                {wedding.couple.groom} & {wedding.couple.bride} · Thiệp nhà trai & nhà gái
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadData(pin, false)}
              disabled={refreshing}
              className="px-3 py-1.5 text-xs font-medium text-[#702b3a] bg-[#f6eee4] hover:bg-[#ecd5c8] rounded-lg border border-[#ddc8ba] flex items-center gap-1.5 transition-colors"
              title="Tải lại dữ liệu mới nhất"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#543b36] hover:text-[#702b3a] bg-white hover:bg-[#f6eee4] rounded-lg border border-[#ddc8ba] transition-colors"
            >
              Xem thiệp
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[#967e73] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Thân bảng điều khiển (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">


          {/* V9: lọc toàn bộ thống kê, lời chúc và RSVP theo phiên bản thiệp */}
          <div className="bg-white border border-[#ddc8ba] rounded-2xl p-3 sm:p-4 flex flex-wrap gap-2 items-center" role="group" aria-label="Lọc theo bên mời">
            <span className="text-xs font-semibold text-[#80545e] mr-2">Thiệp của:</span>
            {(['all','groom','bride','legacy'] as const).map(value => <button key={value} type="button" onClick={()=>setSideFilter(value)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${sideFilter===value?'bg-[#702b3a] text-white shadow-sm':'bg-[#f6eee4] text-[#735052] hover:bg-[#ecd5c8]'}`}
              aria-pressed={sideFilter===value}>{value==='all'?'Tất cả':sideLabels[value]}</button>)}
            <span className="ml-auto text-xs text-[#997a76]">{sideFilter==='all' && stats ? stats.total_rsvps : sideRsvps.length} RSVP · {sideFilter==='all' && stats ? stats.total_wishes : sideWishes.length} lời chúc · {sideAttending.length} sẽ đến · {sideDeclined} báo vắng</span>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#ddc8ba] pb-1">
            <button
              onClick={() => setActiveTab('wishes')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === 'wishes'
                  ? 'bg-white text-[#702b3a] border-t border-x border-[#ddc8ba] shadow-xs'
                  : 'text-[#967e73] hover:text-[#543b36]'
              }`}
            >
              <Mail size={16} />
              <span>Duyệt Lời Chúc</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#702b3a] text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('rsvps')}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
                activeTab === 'rsvps'
                  ? 'bg-white text-[#702b3a] border-t border-x border-[#ddc8ba] shadow-xs'
                  : 'text-[#967e73] hover:text-[#543b36]'
              }`}
            >
              <Users size={16} />
              <span>Danh Sách Khách Mời (RSVP)</span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-[#f6eee4] text-[#702b3a] rounded-full border border-[#ddc8ba]">
                {sideRsvps.length}
              </span>
            </button>
          </div>

          {/* NỘI DUNG TAB 1: DUYỆT LỜI CHÚC */}
          {activeTab === 'wishes' && (
            <div className="space-y-4">
              {/* Thanh lọc & Nút duyệt tất cả */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#ddc8ba]">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['pending', 'approved', 'hidden', 'all'] as const).map(filter => {
                    const labelMap = {
                      pending: `Chờ duyệt (${pendingCount})`,
                      approved: `Đã duyệt (${sideWishes.filter(w=>w.status==='approved').length})`,
                      hidden: `Đã ẩn (${sideWishes.filter(w=>w.status==='hidden').length})`,
                      all: `Tất cả (${sideWishes.length})`,
                    };
                    return (
                      <button
                        key={filter}
                        onClick={() => setWishFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                          wishFilter === filter
                            ? 'bg-[#702b3a] text-white shadow-xs'
                            : 'bg-[#f6eee4] text-[#543b36] hover:bg-[#ecd5c8]'
                        }`}
                      >
                        {labelMap[filter]}
                      </button>
                    );
                  })}
                </div>

                {pendingCount > 0 && (
                  <button
                    onClick={handleApproveAll}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCheck size={15} /> Duyệt tất cả ({pendingCount})
                  </button>
                )}
              </div>

              {/* Danh sách lời chúc */}
              {filteredWishes.length === 0 ? (
                <div className="bg-white border border-[#ddc8ba] rounded-2xl p-10 text-center text-[#967e73]">
                  <Mail size={36} className="mx-auto mb-2 opacity-40 text-[#702b3a]" />
                  <p className="text-sm font-medium">Không có lời chúc nào trong mục này</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {filteredWishes.map(wish => {
                    const status = wish.status || 'pending';
                    return (
                      <div
                        key={wish.id}
                        className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all ${
                          status === 'pending'
                            ? 'border-amber-300 ring-1 ring-amber-200'
                            : status === 'approved'
                            ? 'border-[#ddc8ba]'
                            : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-sm text-[#702b3a]">{wish.guest_name}</h3>
                              <span className="inline-block text-[10px] font-semibold text-[#8a5661] mt-1">{sideLabels[wish.side || 'legacy']}</span>
                              <time className="text-[11px] text-[#967e73]">
                                {new Date(wish.created_at).toLocaleString('vi-VN')}
                              </time>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                                status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : 'Đã ẩn'}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-[#543b36] italic my-3 bg-[#fbf9f5] p-3 rounded-xl border border-[#f0e4dc]">
                            "{wish.message}"
                          </p>
                        </div>

                        {/* Hàng nút hành động */}
                        <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#f0e4dc] mt-2">
                          {status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateWishStatus(wish.id, 'approved')}
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Check size={14} /> Duyệt
                            </button>
                          )}
                          {status !== 'hidden' && (
                            <button
                              onClick={() => handleUpdateWishStatus(wish.id, 'hidden')}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#967e73] hover:text-[#543b36] hover:bg-[#f6eee4] rounded-lg transition-colors"
                            >
                              <EyeOff size={14} /> Ẩn
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteWish(wish.id)}
                            className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* NỘI DUNG TAB 2: DANH SÁCH KHÁCH MỜI (RSVP) */}
          {activeTab === 'rsvps' && (
            <div className="space-y-4">


              {/* Thanh tìm kiếm & lọc */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#ddc8ba] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#967e73]" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên khách hoặc lời nhắn..."
                      value={rsvpSearch}
                      onChange={e => setRsvpSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#fbf9f5] border border-[#ddc8ba] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#702b3a]"
                    />
                  </div>

                  <select
                    value={rsvpStatusFilter}
                    onChange={e => setRsvpStatusFilter(e.target.value as any)}
                    className="px-3 py-2 text-xs bg-[#fbf9f5] border border-[#ddc8ba] rounded-xl text-[#543b36] focus:outline-none"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="attending">Sẽ tham dự</option>
                    <option value="declined">Báo vắng</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopySummary}
                    className="flex-1 md:flex-none px-3 py-2 text-xs font-semibold text-[#702b3a] bg-[#f6eee4] hover:bg-[#ecd5c8] rounded-xl border border-[#ddc8ba] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={14} /> Sao chép gửi Zalo
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 md:flex-none px-3.5 py-2 text-xs font-semibold text-white bg-[#702b3a] hover:bg-[#5a222e] rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download size={14} /> Xuất Excel (CSV)
                  </button>
                </div>
              </div>

              {/* Bảng danh sách khách mời */}
              {filteredRsvps.length === 0 ? (
                <div className="bg-white border border-[#ddc8ba] rounded-2xl p-10 text-center text-[#967e73]">
                  <Users size={36} className="mx-auto mb-2 opacity-40 text-[#702b3a]" />
                  <p className="text-sm font-medium">Chưa có phản hồi nào phù hợp với bộ lọc</p>
                </div>
              ) : (
                <div className="bg-white border border-[#ddc8ba] rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#543b36]">
                      <thead className="bg-[#f6eee4] text-[#702b3a] uppercase tracking-wider font-semibold border-b border-[#ddc8ba]">
                        <tr>
                          <th className="py-3 px-4">Tên Khách Mời</th>
                          <th className="py-3 px-4">Bên Mời</th>
                          <th className="py-3 px-4">Trạng Thái</th>
                          <th className="py-3 px-4">Số Khách</th>
                          <th className="py-3 px-4">Lời Nhắn / Ghi Chú</th>
                          <th className="py-3 px-4">Thời Gian</th>
                          <th className="py-3 px-3 text-right">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0e4dc]">
                        {filteredRsvps.map(r => {
                          const isAttending = r.attending === 1 || r.attending === true;

                          return (
                            <tr key={r.id} className="hover:bg-[#faf7f0] transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-[#702b3a]">
                                {r.guest_name}
                              </td>
                              <td className="py-3.5 px-4 text-[#8a5661] whitespace-nowrap font-semibold">{sideLabels[r.side || 'legacy']}</td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                    isAttending
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isAttending ? <Check size={12} /> : <X size={12} />}
                                  {isAttending ? 'Tham dự' : 'Báo vắng'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-medium">
                                {isAttending ? `${r.guest_count} người` : '—'}
                              </td>
                              <td className="py-3.5 px-4 max-w-xs truncate text-[#543b36]" title={r.note}>
                                {r.note || <span className="text-gray-300 italic">Không có</span>}
                              </td>
                              <td className="py-3.5 px-4 text-[11px] text-[#967e73] whitespace-nowrap">
                                {new Date(r.created_at).toLocaleString('vi-VN')}
                              </td>
                              <td className="py-3.5 px-3 text-right">
                                <button
                                  onClick={() => handleDeleteRSVP(r.id)}
                                  className="p-1 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  title="Xóa phản hồi"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
