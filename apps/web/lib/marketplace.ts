import { apiGet, apiPost, apiPatch } from './api';
import { getAccessToken } from './auth-storage';

function authHeader() {
  return { headers: { Authorization: `Bearer ${getAccessToken()}` } };
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder?: number;
}

export interface SearchArtisan {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  skills: string[];
  categories: ServiceCategory[];
  isOnline: boolean;
  isVerified: boolean;
  distanceKm: number;
  averageRating: number;
  reviewCount: number;
  completedJobsCount: number;
  lat: number;
  lng: number;
}

export interface BookingRecord {
  id: string;
  state: string;
  description: string;
  price: number;
  paymentStatus: string;
  categorySlugs?: string[];
  platformFeePercent?: number | null;
  escrowReleased?: boolean;
  escrowReleasedAmount?: number;
  artisanCompletedAt?: string | null;
  customerConfirmedAt?: string | null;
  pendingPartialPercent?: number | null;
  chatOpen?: boolean;
  canConfirmCompletion?: boolean;
  canDispute?: boolean;
  scheduledDate: string | null;
  scheduledTime: string | null;
  serviceAddress: string | null;
  createdAt: string;
  artisan?: {
    artisanProfile?: { firstName: string; lastName: string; skills: string[] } | null;
  };
  customer?: {
    customerProfile?: { firstName: string; lastName: string } | null;
  };
}

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  return apiGet<ServiceCategory[]>('/categories');
}

export async function searchArtisans(params: {
  lat: number;
  lng: number;
  radiusKm: number;
  categories?: string[];
  q?: string;
  sortBy?: 'distance' | 'rating' | 'jobs_completed';
}): Promise<SearchArtisan[]> {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radiusKm: String(params.radiusKm),
  });
  if (params.categories?.length) query.set('categories', params.categories.join(','));
  if (params.q) query.set('q', params.q);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  return apiGet<SearchArtisan[]>(`/search?${query.toString()}`);
}

export async function createBooking(payload: Record<string, unknown>) {
  return apiPost<{
    booking: BookingRecord;
    payment: { authorization_url: string; reference: string };
    escrow?: { heldAmount: number; platformFeePercent: number; artisanPayoutEstimate: number };
  }>('/booking', payload, authHeader());
}

export async function verifyBookingPayment(reference: string) {
  return apiPost<{ booking: BookingRecord }>('/booking/payment/verify', { reference }, authHeader());
}

export async function fetchMyBookings() {
  return apiGet<BookingRecord[]>('/booking', getAccessToken());
}

export async function updateBookingState(
  id: string,
  state: string,
  extras?: { rating?: number; comment?: string }
) {
  return apiPatch(`/booking/${id}/state`, { state, ...extras }, getAccessToken());
}

export async function confirmBookingCompletion(id: string) {
  return apiPost<BookingRecord>(`/booking/${id}/confirm-completion`, {}, authHeader());
}

export async function requestPartialRelease(id: string, percent: 20 | 50 | 75) {
  return apiPost<BookingRecord>(`/booking/${id}/partial-release/request`, { percent }, authHeader());
}

export async function agreePartialRelease(id: string) {
  return apiPost<{ booking: BookingRecord; partialRelease: { released: number; remaining: number } }>(
    `/booking/${id}/partial-release/agree`,
    {},
    authHeader()
  );
}

export async function raiseBookingDispute(id: string, reason: string) {
  return apiPost(`/booking/${id}/dispute`, { reason }, authHeader());
}

export async function fetchArtisanStats() {
  return apiGet<{
    totalEarnings: number;
    completedJobs: number;
    averageRating: number;
    reviewCount: number;
    monthlyEarnings: Array<{ month: string; amount: number }>;
    growthPercent: number;
  }>('/artisan/stats', getAccessToken());
}

export async function fetchPublicArtisanProfile(userId: string) {
  return apiGet<{
    userId: string;
    firstName: string;
    lastName: string;
    skills: string[];
    categories: ServiceCategory[];
    portfolioUrls: string[];
    isVerified: boolean;
    averageRating: number;
    reviewCount: number;
    completedJobsCount: number;
    memberSince: string;
    verificationBadges: string[];
    responseTimeMinutes: number;
    ratingDistribution: Record<string, number>;
    reviews: Array<{ rating: number; comment: string | null; createdAt: string; reviewerName: string }>;
  }>(`/artisan/public/${userId}`);
}

export async function reportUser(targetUserId: string, reason: string) {
  return apiPost('/moderation/report', { targetUserId, reason }, authHeader());
}

export async function blockUser(targetUserId: string, reason?: string) {
  return apiPost('/moderation/block', { targetUserId, reason }, authHeader());
}

export async function fetchBooking(id: string) {
  return apiGet<BookingRecord & {
    customer?: { id: string; email: string; customerProfile?: { firstName: string; lastName: string } | null };
    artisan?: { id: string; email: string; artisanProfile?: { firstName: string; lastName: string } | null };
  }>(`/booking/${id}`, getAccessToken());
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export async function fetchBookingMessages(bookingId: string) {
  return apiGet<ChatMessage[]>(`/booking/${bookingId}/messages`, getAccessToken());
}

export async function submitVerificationStep(step: number, body: Record<string, unknown>) {
  return apiPost(`/artisan/verification/step-${step}`, body, authHeader());
}

export async function submitVerification() {
  return apiPost('/artisan/verification/submit', {}, authHeader());
}

export async function getVerificationStatus() {
  return apiGet<{
    verificationStatus: string;
    verificationStep: number;
    isVerified: boolean;
    rejectionReason?: string;
    skillTestScore?: number;
    backgroundCheckStatus?: string;
    skillOptions: string[];
  }>('/artisan/verification/status', getAccessToken());
}

export async function fetchSkillTest(skills: string[]) {
  const query = new URLSearchParams({ skills: skills.join(',') });
  return apiGet<{ questions: Array<{ id: string; skill: string; question: string; options: string[] }> }>(
    `/artisan/verification/skill-test?${query.toString()}`,
    getAccessToken()
  );
}

export async function uploadArtisanFile(dataBase64: string, contentType: string) {
  return apiPost<{ url: string; key: string }>('/artisan/upload', { dataBase64, contentType }, authHeader());
}
