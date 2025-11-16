'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para login após 3 segundos
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3] flex items-center justify-center overflow-hidden">
      {/* Logo com animação */}
      <div className="text-center animate-fade-in">
        <div className="mb-8 animate-slide-up">
          <div className="inline-block animate-rotate-gentle">
            <div className="w-32 h-32 bg-gradient-to-br from-[#63402b] to-[#8b5a3c] rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-7xl">🪚</span>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-[#63402b] mb-2 animate-fade-in-delay">
          A Marceneira
        </h1>
        <p className="text-[#8b5a3c] text-lg animate-fade-in-delay-2">
          Gestão Profissional de Projetos
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes rotate-gentle {
          0% {
            transform: rotate(0deg) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: rotate(5deg) scale(1.05);
          }
          100% {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }

        .animate-rotate-gentle {
          animation: rotate-gentle 1.5s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.5s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 1s both;
        }
      `}</style>
    </div>
  )
}
