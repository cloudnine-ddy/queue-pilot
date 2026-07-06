export const activeTicketStatuses = ['WAITING', 'CALLED'];

export const ticketStatusContent = {
  WAITING: {
    badgeClass: 'bg-amber-50 text-amber-800',
    label: 'Waiting',
    message: 'Your number is still waiting in the queue.',
  },
  CALLED: {
    badgeClass: 'bg-emerald-50 text-emerald-800',
    label: 'Called',
    message: null,
  },
  DONE: {
    badgeClass: 'bg-slate-100 text-slate-700',
    label: 'Done',
    message: 'This ticket has been completed.',
  },
  SKIPPED: {
    badgeClass: 'bg-rose-50 text-rose-800',
    label: 'Skipped',
    message: 'Your number was skipped. Please contact the counter staff if you still need help.',
  },
  CANCELLED: {
    badgeClass: 'bg-slate-100 text-slate-700',
    label: 'Cancelled',
    message: 'This ticket was abandoned.',
  },
};

export function getTicketStatusContent(status) {
  return ticketStatusContent[status] || {
    badgeClass: 'bg-slate-100 text-slate-700',
    label: status,
    message: 'Ticket status is being updated.',
  };
}

export function isActiveTicketStatus(status) {
  return activeTicketStatuses.includes(status);
}
