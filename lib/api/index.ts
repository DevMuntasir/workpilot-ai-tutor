export { ApiClient, ApiClientError, apiClient, getApiClientErrorMessage } from '@/lib/api/client'
export { createFirebaseSession, deleteCurrentSession } from '@/lib/api/auth.service'
export {
  cancelCurrentSubscription,
  createSubscriptionCheckout,
  fetchCreditBalance,
  fetchCurrentSubscription,
  fetchSubscriptionPlans,
} from '@/lib/api/billing.service'
export {
  getLatestStudySetGenerationMeta,
  getLatestStudySetUploadMeta,
  getStudySetGenerationMeta,
  getStudySetUploadMeta,
  saveStudySetGenerationMeta,
  saveStudySetUploadMeta,
  updateStudySetGenerationMeta,
} from '@/lib/api/study-sets.storage'
export {
  fetchCompletedStudySetOutput,
  fetchStudySetFlashcards,
  fetchStudySetFillInTheBlanks,
  fetchStudySetGenerationBatchStatus,
  fetchStudySetMultipleChoice,
  fetchStudySetNotes,
  fetchStudySetPodcast,
  fetchStudySetTutorLesson,
  fetchStudySetWrittenTest,
  generateStudySet,
  uploadStudySetPdf,
  uploadStudySetText,
} from '@/lib/api/study-sets.service'
export { clearAuthBrowserState, clearStoredAuthObject, getStoredAccessToken, getStoredAuthObject, saveAuthObject } from '@/lib/api/session-storage'
export type { FirebaseSessionResponse, SessionAuth } from '@/lib/api/auth.service'
export type {
  CreditBalance,
  CurrentSubscription,
  RecentInvoice,
  SubscriptionCheckoutSession,
  SubscriptionPlan,
} from '@/lib/api/billing.service'
export type { StoredAuthObject } from '@/lib/api/session-storage'
export type { StoredStudySetGenerationJob, StoredStudySetGenerationMeta, StoredStudySetUploadMeta } from '@/lib/api/study-sets.storage'
export type {
  BatchCompletedEvent,
  ConnectedEvent,
  JobCompletedEvent,
  JobFailedEvent,
  JobStartedEvent,
  StudySetBatchStatusJob,
  StudySetBatchStatusResponse,
  StudySetGenerateResponse,
  StudySetGenerateType,
  StudySetGenerationBatch,
  StudySetGenerationJob,
  StudySetGenerationSocketEvent,
  StudySetGenerationWebsocket,
  StudySetFlashcardsResponse,
  StudySetFillInTheBlanksResponse,
  StudySetMultipleChoiceResponse,
  StudySetNotesResponse,
  StudySetPodcastResponse,
  StudySetTutorLessonResponse,
  StudySetUploadDocument,
  StudySetUploadResponse,
  StudySetWrittenTestResponse,
} from '@/lib/api/study-sets.service'
