'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function QuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    materialType: '',
    measurementUnit: '',
    workStyle: '',
  })

  const handleNext = () => {
    if (step === 1 && !formData.materialType) {
      toast.error('Selecione um tipo de material')
      return
    }
    if (step === 2 && !formData.measurementUnit) {
      toast.error('Selecione uma unidade de medida')
      return
    }
    if (step === 3 && !formData.workStyle) {
      toast.error('Descreva seu estilo de trabalho')
      return
    }

    if (step < 3) {
      setStep(step + 1)
    } else {
      // Salvar preferências (aqui você pode salvar no Supabase)
      localStorage.setItem('userPreferences', JSON.stringify(formData))
      toast.success('Preferências salvas com sucesso!')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white border-[#c4a57b] shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#63402b] to-[#8b5a3c] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🪚</span>
            </div>
            <h1 className="text-3xl font-bold text-[#63402b] mb-2">
              Bem-vindo ao A Marceneira!
            </h1>
            <p className="text-[#8b5a3c]">
              Vamos configurar suas preferências para uma melhor experiência
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-12 h-2 rounded-full transition-all ${
                  num <= step
                    ? 'bg-gradient-to-r from-[#63402b] to-[#8b5a3c]'
                    : 'bg-[#c4a57b]/30'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Material Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-[#63402b] text-lg font-semibold mb-4 block">
                  Qual tipo de material você mais utiliza?
                </Label>
                <Select
                  value={formData.materialType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, materialType: value })
                  }
                >
                  <SelectTrigger className="border-[#c4a57b] h-14 text-lg">
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdf">MDF (Medium Density Fiberboard)</SelectItem>
                    <SelectItem value="mdp">MDP (Medium Density Particleboard)</SelectItem>
                    <SelectItem value="compensado">Compensado</SelectItem>
                    <SelectItem value="madeira_macica">Madeira Maciça</SelectItem>
                    <SelectItem value="misto">Trabalho com vários materiais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-[#f5f1ed] p-4 rounded-lg border border-[#c4a57b]">
                <p className="text-sm text-[#63402b]">
                  <strong>Dica:</strong> Esta informação nos ajuda a sugerir espessuras e
                  ferragens adequadas para seus projetos.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Measurement Unit */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-[#63402b] text-lg font-semibold mb-4 block">
                  Qual sistema de medidas você prefere?
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'm', label: 'Metros (m)', desc: 'Ex: 2.5m' },
                    { value: 'cm', label: 'Centímetros (cm)', desc: 'Ex: 250cm' },
                    { value: 'mm', label: 'Milímetros (mm)', desc: 'Ex: 2500mm' },
                  ].map((unit) => (
                    <button
                      key={unit.value}
                      onClick={() =>
                        setFormData({ ...formData, measurementUnit: unit.value })
                      }
                      className={`p-6 rounded-xl border-2 transition-all text-center ${
                        formData.measurementUnit === unit.value
                          ? 'border-[#63402b] bg-[#63402b] text-white shadow-lg scale-105'
                          : 'border-[#c4a57b] bg-white text-[#63402b] hover:border-[#63402b]'
                      }`}
                    >
                      <div className="text-2xl font-bold mb-2">{unit.label}</div>
                      <div className="text-sm opacity-80">{unit.desc}</div>
                      {formData.measurementUnit === unit.value && (
                        <CheckCircle2 className="w-6 h-6 mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#f5f1ed] p-4 rounded-lg border border-[#c4a57b]">
                <p className="text-sm text-[#63402b]">
                  <strong>Dica:</strong> Todas as medidas no sistema serão exibidas na
                  unidade que você escolher.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Work Style */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-[#63402b] text-lg font-semibold mb-4 block">
                  Como você costuma trabalhar?
                </Label>
                <Textarea
                  value={formData.workStyle}
                  onChange={(e) =>
                    setFormData({ ...formData, workStyle: e.target.value })
                  }
                  placeholder="Ex: Trabalho principalmente com projetos residenciais, focando em cozinhas e closets planejados. Gosto de usar ferragens de qualidade e acabamentos em laca..."
                  className="border-[#c4a57b] focus:ring-[#63402b] min-h-[150px] text-base"
                />
              </div>

              <div className="bg-[#f5f1ed] p-4 rounded-lg border border-[#c4a57b]">
                <p className="text-sm text-[#63402b]">
                  <strong>Dica:</strong> Essas informações nos ajudam a personalizar
                  sugestões e relatórios para o seu estilo de trabalho.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1 border-[#c4a57b] text-[#63402b] hover:bg-[#f5f1ed]"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-[#63402b] to-[#8b5a3c] hover:from-[#4d3121] hover:to-[#6d4530] text-white shadow-lg"
            >
              {step === 3 ? 'Finalizar' : 'Próximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
