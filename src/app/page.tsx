'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se é o primeiro acesso
    const hasCompletedQuiz = localStorage.getItem('userPreferences')
    
    if (!hasCompletedQuiz) {
      // Primeiro acesso - vai para o quiz
      router.push('/quiz')
    } else {
      // Já completou o quiz - vai para o splash
      router.push('/splash')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#63402b] to-[#8b5a3c] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-5xl">🪚</span>
        </div>
        <p className="text-[#8b5a3c]">Carregando...</p>
      </div>
    </div>
  )
}
