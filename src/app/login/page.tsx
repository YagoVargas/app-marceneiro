'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="p-12 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6">Entrar (temporário)</h1>

        <Button
          className="px-6 py-4 text-lg"
          onClick={() => router.push('/dashboard')}
        >
          Entrar sem login
        </Button>
      </div>
    </div>
  )
}
