'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Settings as SettingsIcon, LogOut, FileText, User } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<any>(null)

  useEffect(() => {
    // Carregar preferências do localStorage
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [])

  const handleLogout = () => {
    toast.success('Logout realizado com sucesso!')
    router.push('/splash')
  }

  const handleEditPreferences = () => {
    router.push('/quiz')
  }

  const getMaterialLabel = (value: string) => {
    const labels: Record<string, string> = {
      mdf: 'MDF',
      mdp: 'MDP',
      compensado: 'Compensado',
      madeira_macica: 'Madeira Maciça',
      misto: 'Vários materiais',
    }
    return labels[value] || value
  }

  const getMeasurementLabel = (value: string) => {
    const labels: Record<string, string> = {
      m: 'Metros (m)',
      cm: 'Centímetros (cm)',
      mm: 'Milímetros (mm)',
    }
    return labels[value] || value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#63402b] to-[#8b5a3c] text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Configurações</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Preferências do Usuário */}
        {preferences && (
          <Card className="bg-white border-[#c4a57b] shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#63402b] rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#63402b]">
                  Suas Preferências
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#f5f1ed] rounded-lg border border-[#c4a57b]">
                  <div>
                    <p className="text-sm text-[#8b5a3c] mb-1">Material Principal</p>
                    <p className="font-semibold text-[#63402b]">
                      {getMaterialLabel(preferences.materialType)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#f5f1ed] rounded-lg border border-[#c4a57b]">
                  <div>
                    <p className="text-sm text-[#8b5a3c] mb-1">Unidade de Medida</p>
                    <p className="font-semibold text-[#63402b]">
                      {getMeasurementLabel(preferences.measurementUnit)}
                    </p>
                  </div>
                </div>

                {preferences.workStyle && (
                  <div className="p-4 bg-[#f5f1ed] rounded-lg border border-[#c4a57b]">
                    <p className="text-sm text-[#8b5a3c] mb-2">Estilo de Trabalho</p>
                    <p className="text-[#63402b]">{preferences.workStyle}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleEditPreferences}
                className="w-full mt-6 bg-white border-2 border-[#63402b] text-[#63402b] hover:bg-[#63402b] hover:text-white transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                Editar Preferências
              </Button>
            </div>
          </Card>
        )}

        {/* Ações */}
        <Card className="bg-white border-[#c4a57b] shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#63402b] mb-4">Ações</h2>
            
            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg justify-start"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair da Conta
              </Button>
            </div>
          </div>
        </Card>

        {/* Informações do Sistema */}
        <Card className="bg-gradient-to-br from-[#c4a57b]/20 to-[#8b5a3c]/20 border-[#c4a57b] shadow-xl">
          <div className="p-6 text-center">
            <p className="text-[#63402b] font-medium mb-1">A Marceneira</p>
            <p className="text-sm text-[#8b5a3c]">Versão 1.0.0</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
