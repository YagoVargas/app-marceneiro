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
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  phone?: string
  address?: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'draft',
  })

  useEffect(() => {
  loadClients()
}, [])

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })
// remover completamente o filtro

        .order('name', { ascending: true })

      if (!error && data) {
        setClients(data)
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const handleSaveClient = async () => {
    if (!newClient.name) {
      toast.error('Nome do cliente é obrigatório')
      return
    }

    try {
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          name: newClient.name,
          phone: newClient.phone,
          address: newClient.address,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        toast.error('Erro ao criar cliente')
        return
      }

      toast.success('Cliente criado com sucesso!')
      setNewClient({ name: '', phone: '', address: '' })
      setIsModalOpen(false)
      await loadClients()
      setFormData({ ...formData, clientId: client.id })
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      toast.error('Erro ao salvar cliente')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      console.log('Iniciando criação do projeto...')

      // Validar campos obrigatórios
      if (!formData.name) {
        toast.error('Nome do projeto é obrigatório')
        setIsSubmitting(false)
        return
      }

      if (!formData.clientId) {
        toast.error('Cliente é obrigatório')
        setIsSubmitting(false)
        return
      }

      console.log('Criando projeto...')
      // Criar projeto com os campos corretos da tabela
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          client_id: formData.clientId,
          status: formData.status,
        })
        .select()
        .single()

      if (projectError) {
        console.error('Erro ao criar projeto:', projectError)
        toast.error(`Erro ao criar projeto: ${projectError.message}`)
        setIsSubmitting(false)
        return
      }

      console.log('Projeto criado com sucesso:', project.id)
      toast.success('Projeto criado com sucesso!')
      
      // Navegar para a página de briefing
      setTimeout(() => {
        console.log('Navegando para briefing...')
        router.push(`/projects/${project.id}/briefing`)
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
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Novo Projeto</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-[#c4a57b] shadow-xl bg-white">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cozinha Planejada - Apartamento 301"
                className="border-[#c4a57b] focus:ring-[#63402b]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva brevemente o projeto..."
                className="border-[#c4a57b] focus:ring-[#63402b] min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger className="border-[#c4a57b] flex-1">
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="border-[#c4a57b] text-[#63402b] hover:bg-[#c4a57b] hover:text-white"
                >
                  + Criar Cliente
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status do Projeto</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-[#c4a57b]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="briefing">Em Briefing</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#63402b] to-[#8b5a3c] hover:from-[#4d3121] hover:to-[#6d4530] text-white shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Criando...' : 'Avançar para Briefing'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Modal Criar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 border-[#c4a57b] shadow-xl bg-white">
            <h2 className="text-xl font-bold mb-4 text-[#63402b]">Criar Novo Cliente</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">Nome *</Label>
                <Input
                  id="modal-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="border-[#c4a57b] focus:ring-[#63402b]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-phone">Telefone</Label>
                <Input
                  id="modal-phone"
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="border-[#c4a57b] focus:ring-[#63402b]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-address">Endereço</Label>
                <Input
                  id="modal-address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="border-[#c4a57b] focus:ring-[#63402b]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="flex-1 border-[#c4a57b] text-[#63402b]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveClient}
                className="flex-1 bg-gradient-to-r from-[#63402b] to-[#8b5a3c] hover:from-[#4d3121] hover:to-[#6d4530] text-white"
              >
                Salvar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
