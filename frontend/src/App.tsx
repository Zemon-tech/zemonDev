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
          <SignInButton>
            <button className="btn btn-primary">Sign In</button>
          </SignInButton>
          <SignUpButton>
            <button className="btn btn-outline">Sign Up</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-4">Welcome to Your App</h1>
            <SignedOut>
              <p>Please sign in to continue</p>
              <div className="card-actions justify-end mt-4">
                <SignInButton>
                  <button className="btn btn-primary">Sign In</button>
                </SignInButton>
              </div>
            </SignedOut>
            <SignedIn>
              <p>You are signed in!</p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-accent">Continue</button>
              </div>
            </SignedIn>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
