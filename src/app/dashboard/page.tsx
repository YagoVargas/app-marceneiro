'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, FolderOpen, Plus, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/splash')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#63402b] to-[#8b5a3c] text-white py-6 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/90 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🪚</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">A Marceneira</h1>
              <p className="text-[#c4a57b] text-sm mt-0.5">Gestão Profissional de Projetos</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Botões Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            onClick={() => router.push('/projects/new')}
            className="bg-gradient-to-br from-[#63402b] to-[#8b5a3c] border-0 shadow-2xl hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Criar Projeto</h3>
            </div>
          </Card>

          <Card
            onClick={() => router.push('/projects')}
            className="bg-white border-[#c4a57b] shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#63402b]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-[#63402b]" />
              </div>
              <h3 className="text-xl font-bold text-[#63402b]">Projetos</h3>
            </div>
          </Card>

          <Card
            onClick={() => router.push('/agenda')}
            className="bg-white border-[#c4a57b] shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#63402b]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#63402b]" />
              </div>
              <h3 className="text-xl font-bold text-[#63402b]">Agenda</h3>
            </div>
          </Card>

          <Card
            onClick={() => router.push('/settings')}
            className="bg-white border-[#c4a57b] shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#63402b]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-[#63402b]" />
              </div>
              <h3 className="text-xl font-bold text-[#63402b]">Configurações</h3>
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-br from-[#c4a57b]/20 to-[#8b5a3c]/20 border-[#c4a57b] shadow-xl">
          <div className="p-8 text-center">
            <p className="text-[#63402b] text-lg font-medium mb-2">
              Sistema completo para gestão de projetos de marcenaria
            </p>
            <p className="text-[#8b5a3c]">
              Organize visitas, crie projetos e gere documentação técnica profissional
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
