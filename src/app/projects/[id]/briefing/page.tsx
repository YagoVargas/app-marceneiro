'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowLeft, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react'
import { supabase, type Project, type ProjectEnvironment, type Module } from '@/lib/supabase'
import { toast } from 'sonner'

const MODULE_TYPES = [
  'Balcões',
  'Balcões de canto',
  'Torre quente',
  'Área da pia',
  'Balcão Ilha',
  'Balcão Cooktop',
  'Aéreos (suspensos)',
]

const ENVIRONMENT_TYPES = [
  'Cozinha',
  'Sala',
  'Quarto',
  'Banheiro',
  'Escritório',
  'Lavanderia',
  'Closet',
  'Área Gourmet',
]

export default function BriefingPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [environments, setEnvironments] = useState<ProjectEnvironment[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [showEnvironmentDialog, setShowEnvironmentDialog] = useState(false)
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)

  const [environmentForm, setEnvironmentForm] = useState({
    name: '',
    type: '',
  })

  const [moduleForm, setModuleForm] = useState({
    name: '',
    hasDoors: false,
    doorCount: 0,
    doorType: '',
    countertopType: '',
    preferences: '',
    hardware: {
      dobradica: false,
      amortecida: false,
      corredica_telescopica: false,
      corredica_oculta: false,
      cantoneiras: false,
      puxadores: '',
    },
  })

  useEffect(() => {
    loadProject()
    loadEnvironments()
  }, [projectId])

  useEffect(() => {
    if (selectedEnvironment) {
      loadModules(selectedEnvironment)
    }
  }, [selectedEnvironment])

  const loadProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, client:clients(*)')
      .eq('id', projectId)
      .single()

    if (!error && data) {
      setProject(data)
    }
  }

  const loadEnvironments = async () => {
    const { data, error } = await supabase
      .from('project_environments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setEnvironments(data)
      if (data.length > 0 && !selectedEnvironment) {
        setSelectedEnvironment(data[0].id)
      }
    }
  }

  const loadModules = async (environmentId: string) => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('environment_id', environmentId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setModules(data)
    }
  }

  const handleAddEnvironment = async () => {
    if (!environmentForm.name) {
      toast.error('Nome do ambiente é obrigatório')
      return
    }

    const { data, error } = await supabase
      .from('project_environments')
      .insert({
        project_id: projectId,
        name: environmentForm.name,
        type: environmentForm.type,
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao adicionar ambiente')
      return
    }

    toast.success('Ambiente adicionado!')
    setEnvironmentForm({ name: '', type: '' })
    setShowEnvironmentDialog(false)
    loadEnvironments()
    setSelectedEnvironment(data.id)
  }

  const handleDeleteEnvironment = async (id: string) => {
    if (!confirm('Deseja realmente excluir este ambiente?')) return

    const { error } = await supabase.from('project_environments').delete().eq('id', id)

    if (error) {
      toast.error('Erro ao excluir ambiente')
      return
    }

    toast.success('Ambiente excluído!')
    loadEnvironments()
    setSelectedEnvironment(null)
  }

  const handleAddModule = async () => {
    if (!selectedEnvironment) {
      toast.error('Selecione um ambiente primeiro')
      return
    }

    if (!moduleForm.name) {
      toast.error('Nome do módulo é obrigatório')
      return
    }

    // Verificar duplicidade
    const exists = modules.some((m) => m.name.toLowerCase() === moduleForm.name.toLowerCase())
    if (exists && !editingModuleId) {
      toast.error('Este módulo já existe neste ambiente')
      return
    }

    const moduleData = {
      environment_id: selectedEnvironment,
      name: moduleForm.name,
      has_doors: moduleForm.hasDoors,
      door_count: moduleForm.doorCount,
      door_type: moduleForm.doorType,
      countertop_type: moduleForm.countertopType,
      preferences: moduleForm.preferences,
      hardware: moduleForm.hardware,
    }

    if (editingModuleId) {
      const { error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', editingModuleId)

      if (error) {
        toast.error('Erro ao atualizar módulo')
        return
      }

      toast.success('Módulo atualizado!')
    } else {
      const { error } = await supabase.from('modules').insert(moduleData)

      if (error) {
        toast.error('Erro ao adicionar módulo')
        return
      }

      toast.success('Módulo adicionado!')
    }

    resetModuleForm()
    setShowModuleDialog(false)
    loadModules(selectedEnvironment)
  }

  const handleEditModule = (module: Module) => {
    setModuleForm({
      name: module.name,
      hasDoors: module.has_doors,
      doorCount: module.door_count,
      doorType: module.door_type || '',
      countertopType: module.countertop_type || '',
      preferences: module.preferences || '',
      hardware: module.hardware || {
        dobradica: false,
        amortecida: false,
        corredica_telescopica: false,
        corredica_oculta: false,
        cantoneiras: false,
        puxadores: '',
      },
    })
    setEditingModuleId(module.id)
    setShowModuleDialog(true)
  }

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Deseja realmente excluir este módulo?')) return

    const { error } = await supabase.from('modules').delete().eq('id', id)

    if (error) {
      toast.error('Erro ao excluir módulo')
      return
    }

    toast.success('Módulo excluído!')
    loadModules(selectedEnvironment!)
  }

  const resetModuleForm = () => {
    setModuleForm({
      name: '',
      hasDoors: false,
      doorCount: 0,
      doorType: '',
      countertopType: '',
      preferences: '',
      hardware: {
        dobradica: false,
        amortecida: false,
        corredica_telescopica: false,
        corredica_oculta: false,
        cantoneiras: false,
        puxadores: '',
      },
    })
    setEditingModuleId(null)
  }

  const handleContinue = () => {
    if (environments.length === 0) {
      toast.error('Adicione pelo menos um ambiente antes de continuar')
      return
    }
    router.push(`/projects/${projectId}/measurements`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => router.push('/projects')}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          {project && (
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-amber-100 text-sm mt-1">Código: {project.code}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ambientes */}
          <Card className="lg:col-span-1 border-orange-200 h-fit">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Ambientes</h2>
                <Dialog open={showEnvironmentDialog} onOpenChange={setShowEnvironmentDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Ambiente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="envName">Nome do Ambiente *</Label>
                        <Input
                          id="envName"
                          value={environmentForm.name}
                          onChange={(e) =>
                            setEnvironmentForm({ ...environmentForm, name: e.target.value })
                          }
                          placeholder="Ex: Cozinha Principal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={environmentForm.type}
                          onValueChange={(value) =>
                            setEnvironmentForm({ ...environmentForm, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {ENVIRONMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type.toLowerCase()}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddEnvironment} className="w-full">
                        Adicionar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEnvironment === env.id
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-white border-gray-200 hover:border-orange-200'
                    }`}
                    onClick={() => setSelectedEnvironment(env.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{env.name}</p>
                        {env.type && (
                          <p className="text-xs text-gray-500 capitalize">{env.type}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEnvironment(env.id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Módulos */}
          <Card className="lg:col-span-2 border-orange-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Módulos
                  {selectedEnvironment &&
                    environments.find((e) => e.id === selectedEnvironment) &&
                    ` - ${environments.find((e) => e.id === selectedEnvironment)?.name}`}
                </h2>
                <Dialog
                  open={showModuleDialog}
                  onOpenChange={(open) => {
                    setShowModuleDialog(open)
                    if (!open) resetModuleForm()
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      disabled={!selectedEnvironment}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Módulo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingModuleId ? 'Editar Módulo' : 'Adicionar Módulo'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo de Módulo *</Label>
                        <Select
                          value={moduleForm.name}
                          onValueChange={(value) =>
                            setModuleForm({ ...moduleForm, name: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione ou digite" />
                          </SelectTrigger>
                          <SelectContent>
                            {MODULE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Ou digite um módulo personalizado"
                          value={moduleForm.name}
                          onChange={(e) =>
                            setModuleForm({ ...moduleForm, name: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasDoors"
                          checked={moduleForm.hasDoors}
                          onCheckedChange={(checked) =>
                            setModuleForm({ ...moduleForm, hasDoors: checked as boolean })
                          }
                        />
                        <Label htmlFor="hasDoors">Possui portas?</Label>
                      </div>

                      {moduleForm.hasDoors && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="doorCount">Quantidade de Portas</Label>
                            <Input
                              id="doorCount"
                              type="number"
                              min="0"
                              value={moduleForm.doorCount}
                              onChange={(e) =>
                                setModuleForm({
                                  ...moduleForm,
                                  doorCount: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo de Porta</Label>
                            <Select
                              value={moduleForm.doorType}
                              onValueChange={(value) =>
                                setModuleForm({ ...moduleForm, doorType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lisa">Lisa</SelectItem>
                                <SelectItem value="provencal">Provençal</SelectItem>
                                <SelectItem value="vidro">Vidro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label>Tipo de Tampo</Label>
                        <Select
                          value={moduleForm.countertopType}
                          onValueChange={(value) =>
                            setModuleForm({ ...moduleForm, countertopType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="marmore">Mármore</SelectItem>
                            <SelectItem value="granito">Granito</SelectItem>
                            <SelectItem value="mdf">MDF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferences">Preferências do Cliente</Label>
                        <Textarea
                          id="preferences"
                          value={moduleForm.preferences}
                          onChange={(e) =>
                            setModuleForm({ ...moduleForm, preferences: e.target.value })
                          }
                          rows={3}
                          placeholder="Cor, acabamento, estilo..."
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Ferragens</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="dobradica"
                              checked={moduleForm.hardware.dobradica}
                              onCheckedChange={(checked) =>
                                setModuleForm({
                                  ...moduleForm,
                                  hardware: {
                                    ...moduleForm.hardware,
                                    dobradica: checked as boolean,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="dobradica">Dobradiça</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="amortecida"
                              checked={moduleForm.hardware.amortecida}
                              onCheckedChange={(checked) =>
                                setModuleForm({
                                  ...moduleForm,
                                  hardware: {
                                    ...moduleForm.hardware,
                                    amortecida: checked as boolean,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="amortecida">Amortecida</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="corredica_telescopica"
                              checked={moduleForm.hardware.corredica_telescopica}
                              onCheckedChange={(checked) =>
                                setModuleForm({
                                  ...moduleForm,
                                  hardware: {
                                    ...moduleForm.hardware,
                                    corredica_telescopica: checked as boolean,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="corredica_telescopica">Corrediça Telescópica</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="corredica_oculta"
                              checked={moduleForm.hardware.corredica_oculta}
                              onCheckedChange={(checked) =>
                                setModuleForm({
                                  ...moduleForm,
                                  hardware: {
                                    ...moduleForm.hardware,
                                    corredica_oculta: checked as boolean,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="corredica_oculta">Corrediça Oculta</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="cantoneiras"
                              checked={moduleForm.hardware.cantoneiras}
                              onCheckedChange={(checked) =>
                                setModuleForm({
                                  ...moduleForm,
                                  hardware: {
                                    ...moduleForm.hardware,
                                    cantoneiras: checked as boolean,
                                  },
                                })
                              }
                            />
                            <Label htmlFor="cantoneiras">Cantoneiras</Label>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="puxadores">Puxadores</Label>
                            <Input
                              id="puxadores"
                              value={moduleForm.hardware.puxadores}
                              onChange={(e) =>
                                setModuleForm({
                                  ...moduleForm,
                                  hardware: {
                                    ...moduleForm.hardware,
                                    puxadores: e.target.value,
                                  },
                                })
                              }
                              placeholder="Descreva o tipo de puxador"
                            />
                          </div>
                        </div>
                      </div>

                      <Button onClick={handleAddModule} className="w-full">
                        {editingModuleId ? 'Atualizar' : 'Adicionar'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="p-4">
              {!selectedEnvironment ? (
                <div className="text-center text-gray-500 py-8">
                  Selecione um ambiente para adicionar módulos
                </div>
              ) : modules.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhum módulo adicionado neste ambiente
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((module) => (
                    <Card key={module.id} className="p-4 border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{module.name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {module.has_doors && (
                              <p>
                                Portas: {module.door_count} {module.door_type && `(${module.door_type})`}
                              </p>
                            )}
                            {module.countertop_type && (
                              <p className="capitalize">Tampo: {module.countertop_type}</p>
                            )}
                            {module.preferences && (
                              <p className="text-xs italic">{module.preferences}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditModule(module)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteModule(module.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Botão Continuar */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            Continuar para Medições
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
