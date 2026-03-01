import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="currentColor" opacity="0.3" />
              <path d="M12 2L3 7l9 5 9-5-9-5z" fill="currentColor" />
              <path d="M12 12v10l9-5V7l-9 5z" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            PhishGuard
          </span>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
