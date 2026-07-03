import { getActiveEvent } from './events.service.js';

export async function getActiveEventHandler(_req, res, next) {
  try {
    const event = await getActiveEvent();

    // if cannot find an event, event will be NULL, because in the event.service.js we use `findFirst`
    if (!event) {
      return res.status(404).json({ message: 'No active event found.' });
    }

    return res.json({ event });
  } catch (error) {
    return next(error);
  }
}
