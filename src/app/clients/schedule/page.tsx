'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { ArrowLeft, Calendar as CalendarIcon, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ScheduleClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [rescheduledDate, setRescheduledDate] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    environmentType: '',
    notes: '',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Validar campos obrigatórios
      if (!formData.name) {
        toast.error('Nome do cliente é obrigatório')
        setIsSubmitting(false)
        return
      }

      if (!selectedDate) {
        toast.error('Data da visita é obrigatória')
        setIsSubmitting(false)
        return
      }

      // Criar cliente
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          user_id: user.id,
        })
        .select()
        .single()

      if (clientError) {
        console.error('Erro ao criar cliente:', clientError)
        toast.error(`Erro ao criar cliente: ${clientError.message}`)
        setIsSubmitting(false)
        return
      }

      // Criar agendamento
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: client.id,
          environment_type: formData.environmentType,
          scheduled_date: selectedDate.toISOString(),
          rescheduled_date: rescheduledDate?.toISOString(),
          notes: formData.notes,
          status: 'pending',
          user_id: user.id,
        })

      if (appointmentError) {
        console.error('Erro ao criar agendamento:', appointmentError)
        toast.error(`Erro ao criar agendamento: ${appointmentError.message}`)
        setIsSubmitting(false)
        return
      }

      toast.success('Cliente e agendamento salvos com sucesso!')
      
      // Redirecionar para dashboard ou lista de clientes
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error) {
      console.error('Erro geral:', error)
      toast.error('Erro ao processar solicitação')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] via-[#faf8f5] to-[#ede8e3]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#63402b] to-[#8b5a3c] text-white py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Agendar Visita - Novo Cliente</h1>
          <p className="text-white/80 mt-2">Cadastre o cliente e agende a visita técnica</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário do Cliente */}
            <Card className="border-[#c4a57b] shadow-xl bg-white p-6">
              <h2 className="text-xl font-bold text-[#63402b] mb-6 flex items-center">
                <span className="bg-[#63402b] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                Dados do Cliente
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Cliente *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João Silva"
                    className="border-[#c4a57b] focus:ring-[#63402b]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="border-[#c4a57b] focus:ring-[#63402b]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, complemento, bairro, cidade..."
                    className="border-[#c4a57b] focus:ring-[#63402b] min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmentType">Tipo de Ambiente Solicitado</Label>
                  <Select
                    value={formData.environmentType}
                    onValueChange={(value) => setFormData({ ...formData, environmentType: value })}
                  >
                    <SelectTrigger className="border-[#c4a57b]">
                      <SelectValue placeholder="Selecione o ambiente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cozinha">Cozinha</SelectItem>
                      <SelectItem value="sala">Sala</SelectItem>
                      <SelectItem value="quarto">Quarto</SelectItem>
                      <SelectItem value="banheiro">Banheiro</SelectItem>
                      <SelectItem value="escritorio">Escritório</SelectItem>
                      <SelectItem value="lavanderia">Lavanderia</SelectItem>
                      <SelectItem value="closet">Closet</SelectItem>
                      <SelectItem value="area_gourmet">Área Gourmet</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Rápidas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Anotações importantes sobre o cliente ou projeto..."
                    className="border-[#c4a57b] focus:ring-[#63402b] min-h-[100px]"
                  />
                </div>
              </div>
            </Card>

            {/* Calendário e Agendamento */}
            <div className="space-y-6">
              <Card className="border-[#c4a57b] shadow-xl bg-white p-6">
                <h2 className="text-xl font-bold text-[#63402b] mb-6 flex items-center">
                  <span className="bg-[#63402b] text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                  Agendar Visita
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Data Marcada para Visita *
                    </Label>
                    <div className="border border-[#c4a57b] rounded-lg p-4 bg-[#faf8f5]">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={ptBR}
                        className="rounded-md"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </div>
                    {selectedDate && (
                      <p className="text-sm text-[#63402b] font-medium mt-2">
                        Data selecionada: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="border-[#c4a57b] shadow-xl bg-white p-6">
                <h3 className="text-lg font-semibold text-[#63402b] mb-4">Reagendamento (Opcional)</h3>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">
                    Caso precise reagendar, selecione uma nova data
                  </Label>
                  <div className="border border-[#c4a57b] rounded-lg p-4 bg-[#faf8f5]">
                    <Calendar
                      mode="single"
                      selected={rescheduledDate}
                      onSelect={setRescheduledDate}
                      locale={ptBR}
                      className="rounded-md"
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </div>
                  {rescheduledDate && (
                    <p className="text-sm text-[#63402b] font-medium mt-2">
                      Nova data: {format(rescheduledDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#63402b] to-[#8b5a3c] hover:from-[#4d3121] hover:to-[#6d4530] text-white shadow-lg px-8 py-6 text-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Cliente e Agendamento'}
              <Save className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
