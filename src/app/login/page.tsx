'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Check, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Login de verdade
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      return
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_first_login')
      .eq('user_id', data.user?.id)
      .single()

    if (!profile) {
      return router.push('/dashboard')
    }

    if (profile.is_first_login) {
      return router.push('/quiz')
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3]">
      <div className="pt-12 pb-8 text-center">
        <div className="inline-block mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#63402b] to-[#8b5a3c] rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-5xl">🪚</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-[#63402b] mb-2">A Marceneira</h1>
        <p className="text-[#8b5a3c]">Gestão Profissional de Projetos</p>
      </div>

      <div className="max-w-md mx-auto px-4 mb-16">
        <Card className="bg-white border-[#c4a57b] shadow-2xl">
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <p className="text-red-600 text-center text-sm">{error}</p>
            )}

            <div>
              <label className="block text-[#63402b] text-sm font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="border-[#c4a57b]"
                required
              />
            </div>

            <div>
              <label className="block text-[#63402b] text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-[#c4a57b] pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b5a3c]"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#63402b] to-[#8b5a3c] text-white py-6 text-lg shadow-lg"
            >
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
