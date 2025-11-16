'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Check, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulação de login - redireciona para dashboard
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3]">
      {/* Header com Logo */}
      <div className="pt-12 pb-8 text-center">
        <div className="inline-block mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#63402b] to-[#8b5a3c] rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-5xl">🪚</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-[#63402b] mb-2">A Marceneira</h1>
        <p className="text-[#8b5a3c]">Gestão Profissional de Projetos</p>
      </div>

      {/* Formulário de Login */}
      <div className="max-w-md mx-auto px-4 mb-16">
        <Card className="bg-white border-[#c4a57b] shadow-2xl">
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-[#63402b] text-sm font-medium mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="border-[#c4a57b] focus:ring-[#63402b]"
                required
              />
            </div>

            <div>
              <label className="block text-[#63402b] text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-[#c4a57b] focus:ring-[#63402b] pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b5a3c] hover:text-[#63402b] transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#63402b] to-[#8b5a3c] hover:from-[#4d3121] hover:to-[#6d4530] text-white font-semibold py-6 text-lg shadow-lg"
            >
              Entrar
            </Button>

            <p className="text-center text-[#8b5a3c] text-sm">
              Não tem uma conta?{' '}
              <a href="#planos" className="text-[#63402b] hover:text-[#8b5a3c] font-medium">
                Veja nossos planos
              </a>
            </p>
          </form>
        </Card>
      </div>

      {/* Seção de Planos */}
      <div id="planos" className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#63402b] mb-3">
            Escolha seu Plano
          </h2>
          <p className="text-[#8b5a3c]">
            Acesso completo ao sistema de gestão de projetos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Básico */}
          <Card className="bg-white border-[#c4a57b] shadow-2xl hover:scale-105 transition-transform duration-300">
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#63402b] mb-2">
                  Plano Básico
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-[#63402b]">
                    R$ 49
                  </span>
                  <span className="text-[#8b5a3c]">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#63402b] mt-0.5 flex-shrink-0" />
                  <span className="text-[#63402b]">Até 10 projetos ativos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#63402b] mt-0.5 flex-shrink-0" />
                  <span className="text-[#63402b]">Agenda de visitas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#63402b] mt-0.5 flex-shrink-0" />
                  <span className="text-[#63402b]">Geração de croquis em PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#63402b] mt-0.5 flex-shrink-0" />
                  <span className="text-[#63402b]">Suporte por email</span>
                </li>
              </ul>

              <Button className="w-full bg-white border-2 border-[#63402b] text-[#63402b] hover:bg-[#63402b] hover:text-white py-6 text-lg transition-all">
                Começar Agora
              </Button>
            </div>
          </Card>

          {/* Plano Profissional */}
          <Card className="bg-gradient-to-br from-[#63402b] to-[#8b5a3c] border-0 shadow-2xl hover:scale-105 transition-transform duration-300 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#c4a57b] text-[#63402b] px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                Mais Popular
              </span>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Plano Profissional
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">
                    R$ 99
                  </span>
                  <span className="text-[#c4a57b]">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#c4a57b] mt-0.5 flex-shrink-0" />
                  <span className="text-white">Projetos ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#c4a57b] mt-0.5 flex-shrink-0" />
                  <span className="text-white">Agenda de visitas avançada</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#c4a57b] mt-0.5 flex-shrink-0" />
                  <span className="text-white">Geração de croquis em PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#c4a57b] mt-0.5 flex-shrink-0" />
                  <span className="text-white">Armazenamento de fotos ilimitado</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#c4a57b] mt-0.5 flex-shrink-0" />
                  <span className="text-white">Suporte prioritário</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#c4a57b] mt-0.5 flex-shrink-0" />
                  <span className="text-white">Relatórios personalizados</span>
                </li>
              </ul>

              <Button className="w-full bg-white text-[#63402b] hover:bg-[#c4a57b] py-6 text-lg shadow-lg font-semibold">
                Começar Agora
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-center text-[#8b5a3c] text-sm mt-8">
          * Acesso válido por 30 dias a partir da data de compra
        </p>
      </div>
    </div>
  )
}
