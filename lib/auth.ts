export interface User {
  id: number;
  nama: string;
  username: string;
  role: 'admin' | 'kasir' | 'owner';
  id_outlet?: number;
  outlet?: {
    id: number;
    nama: string;
  };
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

export function hasPermission(user: User | null, feature: string): boolean {
  if (!user) return false;

  const permissions = {
    admin: ['login', 'logout', 'registrasi_pelanggan', 'crud_outlet', 'crud_produk', 'crud_pengguna', 'entri_transaksi', 'generate_laporan'],
    kasir: ['login', 'logout', 'registrasi_pelanggan', 'entri_transaksi', 'generate_laporan'],
    owner: ['login', 'logout', 'registrasi_pelanggan', 'entri_transaksi', 'generate_laporan']
  };

  return permissions[user.role]?.includes(feature) || false;
}
