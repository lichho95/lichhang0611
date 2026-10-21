import { AdminDashboard } from '../components/AdminDashboard';

/**
 * Trang quản trị độc lập — render tại route /admin.
 * Không phụ thuộc vào trạng thái App chính (opening, music, lightbox, …).
 */
export default function AdminPage() {
  const handleClose = () => {
    // Quay về trang chủ khi bấm "Quay lại thiệp cưới"
    window.location.href = '/';
  };

  return <AdminDashboard onClose={handleClose} />;
}
