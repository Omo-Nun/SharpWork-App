export function isChatOpen(state: string): boolean {
  return state === 'ACCEPTED' || state === 'IN_PROGRESS';
}

export function chatStatusMessage(state: string, paymentStatus?: string): string {
  if (state === 'PENDING') {
    return paymentStatus === 'PAID'
      ? 'Waiting for the artisan to accept. Chat opens after acceptance.'
      : 'Complete payment to send this booking to the artisan.';
  }
  if (state === 'COMPLETED' || state === 'REVIEWED') {
    return 'This job is complete. Chat is closed.';
  }
  if (isChatOpen(state)) {
    return 'Chat with your job partner below.';
  }
  return 'Chat is not available for this booking.';
}
