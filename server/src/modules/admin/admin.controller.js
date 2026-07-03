import {
  createEvent,
  createFaculty,
  createOperator,
  endEvent,
  getAdminEvents,
  getAdminEventDetail,
  getAdminFaculties,
  getAdminOperators,
  getAdminOverview,
  getAdminProfile,
  resetOperatorPassword,
  startEvent,
  updateFaculty,
  updateOperator,
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

export async function getAdminEventsHandler(_req, res, next) {
  try {
    const events = await getAdminEvents();

    return res.json({ events });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminEventDetailHandler(req, res, next) {
  try {
    const { eventId } = req.params;
    const detail = await getAdminEventDetail(eventId);

    return res.json(detail);
  } catch (error) {
    return next(error);
  }
}

export async function createEventHandler(req, res, next) {
  try {
    const event = await createEvent(req.body);

    return res.status(201).json({ event });
  } catch (error) {
    return next(error);
  }
}

export async function startEventHandler(req, res, next) {
  try {
    const { eventId } = req.params;
    const event = await startEvent(eventId);

    return res.json({ event });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminFacultiesHandler(_req, res, next) {
  try {
    const faculties = await getAdminFaculties();

    return res.json({ faculties });
  } catch (error) {
    return next(error);
  }
}

export async function createFacultyHandler(req, res, next) {
  try {
    const faculty = await createFaculty(req.body);

    return res.status(201).json({ faculty });
  } catch (error) {
    return next(error);
  }
}

export async function updateFacultyHandler(req, res, next) {
  try {
    const { facultyId } = req.params;
    const faculty = await updateFaculty(facultyId, req.body);

    return res.json({ faculty });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminOperatorsHandler(_req, res, next) {
  try {
    const operators = await getAdminOperators();

    return res.json({ operators });
  } catch (error) {
    return next(error);
  }
}

export async function createOperatorHandler(req, res, next) {
  try {
    const operator = await createOperator(req.body);

    return res.status(201).json({ operator });
  } catch (error) {
    return next(error);
  }
}

export async function updateOperatorHandler(req, res, next) {
  try {
    const { operatorId } = req.params;
    const operator = await updateOperator(operatorId, req.body);

    return res.json({ operator });
  } catch (error) {
    return next(error);
  }
}

export async function resetOperatorPasswordHandler(req, res, next) {
  try {
    const { operatorId } = req.params;
    const { password } = req.body;
    const operator = await resetOperatorPassword(operatorId, password);

    return res.json({ operator });
  } catch (error) {
    return next(error);
  }
}
