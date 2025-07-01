import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

function App() {
  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen flex flex-col">
      <header className="flex justify-end py-4 gap-4 mb-8">
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="mb-4">Welcome to Your App</h1>
        <SignedOut>
          <p>Please sign in to continue</p>
        </SignedOut>
        <SignedIn>
          <p>You are signed in!</p>
        </SignedIn>
      </main>
    </div>
  )
}

export default App
