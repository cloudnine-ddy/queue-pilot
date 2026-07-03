export function getAdminProfile(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
}
