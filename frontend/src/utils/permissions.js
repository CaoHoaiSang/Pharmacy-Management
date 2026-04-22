export const isAdmin = (user) => user?.role === "admin";
export const isStaff = (user) => user?.role === "staff";
export const isWarehouse = (user) => user?.role === "warehouse";

const hasRole = (user, roles) => Boolean(user) && roles.includes(user.role);

export const canManageMedicines = (user) => hasRole(user, ["admin", "warehouse"]);

export const canManageCategories = (user) => hasRole(user, ["admin", "warehouse"]);

export const canManageSuppliers = (user) => hasRole(user, ["admin", "warehouse"]);

export const canViewCustomers = (user) => hasRole(user, ["admin", "staff"]);

export const canManageCustomers = (user) => canViewCustomers(user);

export const canDeleteCustomers = (user) => isAdmin(user);

export const canViewInvoices = (user) => hasRole(user, ["admin", "staff"]);

export const canCreateInvoices = (user) => canViewInvoices(user);

export const canDeleteInvoices = (user) => isAdmin(user);

export const canViewAdminDashboard = (user) => isAdmin(user);

export const getRoleLabel = (role) => {
  if (role === "admin") {
    return "Quản trị viên";
  }

  if (role === "staff") {
    return "Nhân viên";
  }

  if (role === "warehouse") {
    return "Quản lý kho";
  }

  return "Chưa phân quyền";
};
