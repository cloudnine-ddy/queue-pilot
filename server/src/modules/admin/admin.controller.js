import { getAdminProfile } from './admin.service.js';

export function getAdminProfileHandler(req, res) {
  return res.json({
    admin: getAdminProfile(req.admin),
  });
}
