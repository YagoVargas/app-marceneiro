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
import { ArrowLeft, Calendar, Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase, type Appointment, type Client } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function AgendaPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    environmentType: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    useExistingClient: false,
    existingClientId: '',
  })

  useEffect(() => {
    loadAppointments()
    loadClients()
  }, [])

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, client:clients(*)')
      .order('scheduled_date', { ascending: true })

    if (!error && data) {
      setAppointments(data)
    }
  }

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })

    if (!error && data) {
      setClients(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let clientId = formData.existingClientId

    // Criar novo cliente se necessário
    if (!formData.useExistingClient) {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: formData.clientName,
          phone: formData.clientPhone,
          address: formData.clientAddress,
        })
        .select()
        .single()

      if (clientError) {
        toast.error('Erro ao criar cliente')
        return
      }

      clientId = newClient.id
    }

    const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`

    if (editingId) {
      // Atualizar agendamento
      const { error } = await supabase
        .from('appointments')
        .update({
          client_id: clientId,
          environment_type: formData.environmentType,
          scheduled_date: scheduledDateTime,
          notes: formData.notes,
        })
        .eq('id', editingId)

      if (error) {
        toast.error('Erro ao atualizar agendamento')
        return
      }

      toast.success('Agendamento atualizado!')
    } else {
      // Criar novo agendamento
      const { error } = await supabase.from('appointments').insert({
        client_id: clientId,
        environment_type: formData.environmentType,
        scheduled_date: scheduledDateTime,
        notes: formData.notes,
        status: 'pending',
      })

      if (error) {
        toast.error('Erro ao criar agendamento')
        return
      }

      toast.success('Agendamento criado!')
    }

    resetForm()
    loadAppointments()
    loadClients()
  }

  const handleEdit = (appointment: Appointment) => {
    const date = new Date(appointment.scheduled_date)
    setFormData({
      clientName: appointment.client?.name || '',
      clientPhone: appointment.client?.phone || '',
      clientAddress: appointment.client?.address || '',
      environmentType: appointment.environment_type || '',
      scheduledDate: format(date, 'yyyy-MM-dd'),
      scheduledTime: format(date, 'HH:mm'),
      notes: appointment.notes || '',
      useExistingClient: true,
      existingClientId: appointment.client_id || '',
    })
    setEditingId(appointment.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este agendamento?')) return

    const { error } = await supabase.from('appointments').delete().eq('id', id)

    if (error) {
      toast.error('Erro ao excluir agendamento')
      return
    }

    toast.success('Agendamento excluído!')
    loadAppointments()
  }

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      environmentType: '',
      scheduledDate: '',
      scheduledTime: '',
      notes: '',
      useExistingClient: false,
      existingClientId: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Agenda</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Botão Novo Agendamento */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        )}

        {/* Formulário */}
        {showForm && (
          <Card className="mb-6 border-orange-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>

              {/* Cliente Existente ou Novo */}
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={formData.useExistingClient ? 'existing' : 'new'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, useExistingClient: value === 'existing' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo Cliente</SelectItem>
                    <SelectItem value="existing">Cliente Existente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.useExistingClient ? (
                <div className="space-y-2">
                  <Label>Selecionar Cliente</Label>
                  <Select
                    value={formData.existingClientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, existingClientId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nome do Cliente *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, clientPhone: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Endereço</Label>
                    <Input
                      id="clientAddress"
                      value={formData.clientAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, clientAddress: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="environmentType">Tipo de Ambiente</Label>
                <Select
                  value={formData.environmentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, environmentType: value })
                  }
                >
                  <SelectTrigger>
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
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Data da Visita *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Horário *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Agendamentos</h2>
          {appointments.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum agendamento cadastrado</p>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {appointment.client?.name || 'Cliente'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.environment_type || 'Ambiente não especificado'}
                    </p>
                    <p className="text-sm text-orange-700 font-medium mt-2">
                      {format(new Date(appointment.scheduled_date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-2">{appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(appointment)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
