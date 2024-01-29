import { LoginButton } from "@/components/auth/login-button"
import { Button } from "@/components/ui/button"
import { cn  } from "@/lib/utils"
import { Poppins } from "next/font/google"

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-sky-500">
      <div className="space-y-6">
        <h1 className={cn("text-6xl text-center font-seimbold text-white drop-shadow-md",font.className,)}>
          JetSki app
        </h1>
        <p>
          Authentication service
        </p>
        <div className="text-center">
          <LoginButton>
            <Button variant="secondary" size="lg">
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  )
}

