import {
  endEvent,
  getAdminOverview,
  getAdminProfile,
} from './admin.service.js';

export function getAdminProfileHandler(req, res) {
  return res.json({
    admin: getAdminProfile(req.admin),
  });
}

export async function getAdminOverviewHandler(_req, res, next) {
  try {
    const overview = await getAdminOverview();

    return res.json(overview);
  } catch (error) {
    return next(error);
  }
}

export async function endEventHandler(req, res, next) {
  try {
    const { eventId } = req.params;
    const event = await endEvent(eventId);

    return res.json({ event });
  } catch (error) {
    return next(error);
  }
}
