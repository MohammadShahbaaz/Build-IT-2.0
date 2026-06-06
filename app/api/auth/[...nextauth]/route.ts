import { handlers } from '@/lib/auth'

// These are the GET and POST handlers NextAuth needs
// GET handles redirecting to Google
// POST handles Google's response coming back
export const { GET, POST } = handlers