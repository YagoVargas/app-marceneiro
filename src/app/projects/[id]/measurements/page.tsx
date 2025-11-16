'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  Image as ImageIcon,
} from 'lucide-react'
import {
  supabase,
  type Project,
  type ProjectEnvironment,
  type Wall,
  type Opening,
  type HydraulicPoint,
  type ElectricalPoint,
} from '@/lib/supabase'
import { toast } from 'sonner'

export default function MeasurementsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [environments, setEnvironments] = useState<ProjectEnvironment[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null)
  const [walls, setWalls] = useState<Wall[]>([])
  const [selectedWall, setSelectedWall] = useState<string | null>(null)
  const [openings, setOpenings] = useState<Opening[]>([])
  const [hydraulicPoints, setHydraulicPoints] = useState<HydraulicPoint[]>([])
  const [electricalPoints, setElectricalPoints] = useState<ElectricalPoint[]>([])

  const [showWallDialog, setShowWallDialog] = useState(false)
  const [showOpeningDialog, setShowOpeningDialog] = useState(false)
  const [showHydraulicDialog, setShowHydraulicDialog] = useState(false)
  const [showElectricalDialog, setShowElectricalDialog] = useState(false)

  const [wallForm, setWallForm] = useState({
    height: '',
    width: '',
    photoUrl: '',
  })

  const [openingForm, setOpeningForm] = useState({
    type: 'porta',
    width: '',
    height: '',
    heightFromFloor: '',
    moldingMeasurements: '',
    isInternal: true,
    distanceFromSide: '',
    referenceSide: 'esquerda',
  })

  const [hydraulicForm, setHydraulicForm] = useState({
    type: 'entrada_agua',
    diameter: '',
    distanceFromSide: '',
    heightFromFloor: '',
  })

  const [electricalForm, setElectricalForm] = useState({
    type: 'tomada',
    heightFromFloor: '',
    distanceFromSide: '',
    referenceSide: 'esquerda',
  })

  useEffect(() => {
    loadProject()
    loadEnvironments()
  }, [projectId])

  useEffect(() => {
    if (selectedEnvironment) {
      loadWalls(selectedEnvironment)
    }
  }, [selectedEnvironment])

  useEffect(() => {
    if (selectedWall) {
      loadWallDetails(selectedWall)
    }
  }, [selectedWall])

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

  const loadWalls = async (environmentId: string) => {
    const { data, error } = await supabase
      .from('walls')
      .select('*')
      .eq('environment_id', environmentId)
      .order('wall_number', { ascending: true })

    if (!error && data) {
      setWalls(data)
      if (data.length > 0 && !selectedWall) {
        setSelectedWall(data[0].id)
      }
    }
  }

  const loadWallDetails = async (wallId: string) => {
    // Carregar aberturas
    const { data: openingsData } = await supabase
      .from('openings')
      .select('*')
      .eq('wall_id', wallId)
      .order('created_at', { ascending: true })

    if (openingsData) setOpenings(openingsData)

    // Carregar pontos hidráulicos
    const { data: hydraulicData } = await supabase
      .from('hydraulic_points')
      .select('*')
      .eq('wall_id', wallId)
      .order('created_at', { ascending: true })

    if (hydraulicData) setHydraulicPoints(hydraulicData)

    // Carregar pontos elétricos
    const { data: electricalData } = await supabase
      .from('electrical_points')
      .select('*')
      .eq('wall_id', wallId)
      .order('created_at', { ascending: true })

    if (electricalData) setElectricalPoints(electricalData)
  }

  const handleAddWall = async () => {
    if (!selectedEnvironment) {
      toast.error('Selecione um ambiente primeiro')
      return
    }

    const wallNumber = `W${walls.length + 1}`

    const { data, error } = await supabase
      .from('walls')
      .insert({
        environment_id: selectedEnvironment,
        wall_number: wallNumber,
        height: parseFloat(wallForm.height) || null,
        width: parseFloat(wallForm.width) || null,
        photo_url: wallForm.photoUrl || null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao adicionar parede')
      return
    }

    toast.success(`Parede ${wallNumber} adicionada!`)
    setWallForm({ height: '', width: '', photoUrl: '' })
    setShowWallDialog(false)
    loadWalls(selectedEnvironment)
    setSelectedWall(data.id)
  }

  const handleAddOpening = async () => {
    if (!selectedWall) {
      toast.error('Selecione uma parede primeiro')
      return
    }

    const { error } = await supabase.from('openings').insert({
      wall_id: selectedWall,
      type: openingForm.type,
      width: parseFloat(openingForm.width) || null,
      height: parseFloat(openingForm.height) || null,
      height_from_floor: parseFloat(openingForm.heightFromFloor) || null,
      molding_measurements: openingForm.moldingMeasurements || null,
      is_internal: openingForm.isInternal,
      distance_from_side: parseFloat(openingForm.distanceFromSide) || null,
      reference_side: openingForm.referenceSide,
    })

    if (error) {
      toast.error('Erro ao adicionar abertura')
      return
    }

    toast.success('Abertura adicionada!')
    resetOpeningForm()
    setShowOpeningDialog(false)
    loadWallDetails(selectedWall)
  }

  const handleAddHydraulic = async () => {
    if (!selectedWall) {
      toast.error('Selecione uma parede primeiro')
      return
    }

    const { error } = await supabase.from('hydraulic_points').insert({
      wall_id: selectedWall,
      type: hydraulicForm.type,
      diameter: hydraulicForm.diameter || null,
      distance_from_side: parseFloat(hydraulicForm.distanceFromSide) || null,
      height_from_floor: parseFloat(hydraulicForm.heightFromFloor) || null,
    })

    if (error) {
      toast.error('Erro ao adicionar ponto hidráulico')
      return
    }

    toast.success('Ponto hidráulico adicionado!')
    resetHydraulicForm()
    setShowHydraulicDialog(false)
    loadWallDetails(selectedWall)
  }

  const handleAddElectrical = async () => {
    if (!selectedWall) {
      toast.error('Selecione uma parede primeiro')
      return
    }

    // Gerar número automático
    const typePrefix = electricalForm.type === 'tomada' ? 'T' : electricalForm.type === 'interruptor' ? 'I' : 'D'
    const existingCount = electricalPoints.filter((p) => p.type === electricalForm.type).length
    const pointNumber = `${typePrefix}${existingCount + 1}`

    const { error } = await supabase.from('electrical_points').insert({
      wall_id: selectedWall,
      type: electricalForm.type,
      point_number: pointNumber,
      height_from_floor: parseFloat(electricalForm.heightFromFloor) || null,
      distance_from_side: parseFloat(electricalForm.distanceFromSide) || null,
      reference_side: electricalForm.referenceSide,
    })

    if (error) {
      toast.error('Erro ao adicionar ponto elétrico')
      return
    }

    toast.success(`Ponto ${pointNumber} adicionado!`)
    resetElectricalForm()
    setShowElectricalDialog(false)
    loadWallDetails(selectedWall)
  }

  const handleDeleteOpening = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta abertura?')) return

    const { error } = await supabase.from('openings').delete().eq('id', id)

    if (error) {
      toast.error('Erro ao excluir abertura')
      return
    }

    toast.success('Abertura excluída!')
    loadWallDetails(selectedWall!)
  }

  const handleDeleteHydraulic = async (id: string) => {
    if (!confirm('Deseja realmente excluir este ponto hidráulico?')) return

    const { error } = await supabase.from('hydraulic_points').delete().eq('id', id)

    if (error) {
      toast.error('Erro ao excluir ponto hidráulico')
      return
    }

    toast.success('Ponto hidráulico excluído!')
    loadWallDetails(selectedWall!)
  }

  const handleDeleteElectrical = async (id: string) => {
    if (!confirm('Deseja realmente excluir este ponto elétrico?')) return

    const { error } = await supabase.from('electrical_points').delete().eq('id', id)

    if (error) {
      toast.error('Erro ao excluir ponto elétrico')
      return
    }

    toast.success('Ponto elétrico excluído!')
    loadWallDetails(selectedWall!)
  }

  const resetOpeningForm = () => {
    setOpeningForm({
      type: 'porta',
      width: '',
      height: '',
      heightFromFloor: '',
      moldingMeasurements: '',
      isInternal: true,
      distanceFromSide: '',
      referenceSide: 'esquerda',
    })
  }

  const resetHydraulicForm = () => {
    setHydraulicForm({
      type: 'entrada_agua',
      diameter: '',
      distanceFromSide: '',
      heightFromFloor: '',
    })
  }

  const resetElectricalForm = () => {
    setElectricalForm({
      type: 'tomada',
      heightFromFloor: '',
      distanceFromSide: '',
      referenceSide: 'esquerda',
    })
  }

  const currentWall = walls.find((w) => w.id === selectedWall)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => router.push(`/projects/${projectId}/briefing`)}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          {project && (
            <div>
              <h1 className="text-3xl font-bold">Medições - {project.name}</h1>
              <p className="text-amber-100 text-sm mt-1">Código: {project.code}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ambientes */}
          <Card className="lg:col-span-1 border-orange-200 h-fit">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ambientes</h2>
              <div className="space-y-2">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEnvironment === env.id
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-white border-gray-200 hover:border-orange-200'
                    }`}
                    onClick={() => {
                      setSelectedEnvironment(env.id)
                      setSelectedWall(null)
                    }}
                  >
                    <p className="font-medium text-gray-900">{env.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Paredes */}
            {selectedEnvironment && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Paredes</h3>
                  <Dialog open={showWallDialog} onOpenChange={setShowWallDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Parede (W{walls.length + 1})</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="height">Altura (m)</Label>
                          <Input
                            id="height"
                            type="number"
                            step="0.01"
                            value={wallForm.height}
                            onChange={(e) =>
                              setWallForm({ ...wallForm, height: e.target.value })
                            }
                            placeholder="Ex: 2.80"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="width">Comprimento (m)</Label>
                          <Input
                            id="width"
                            type="number"
                            step="0.01"
                            value={wallForm.width}
                            onChange={(e) =>
                              setWallForm({ ...wallForm, width: e.target.value })
                            }
                            placeholder="Ex: 3.50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="photoUrl">URL da Foto</Label>
                          <Input
                            id="photoUrl"
                            value={wallForm.photoUrl}
                            onChange={(e) =>
                              setWallForm({ ...wallForm, photoUrl: e.target.value })
                            }
                            placeholder="Cole a URL da foto"
                          />
                        </div>
                        <Button onClick={handleAddWall} className="w-full">
                          Adicionar Parede
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {walls.map((wall) => (
                    <div
                      key={wall.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedWall === wall.id
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-white border-gray-200 hover:border-amber-200'
                      }`}
                      onClick={() => setSelectedWall(wall.id)}
                    >
                      <p className="font-medium text-gray-900">{wall.wall_number}</p>
                      {wall.height && wall.width && (
                        <p className="text-xs text-gray-500">
                          {wall.height}m × {wall.width}m
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Detalhes da Parede */}
          <Card className="lg:col-span-3 border-orange-200">
            {!selectedWall ? (
              <div className="p-8 text-center text-gray-500">
                Selecione uma parede para adicionar detalhes
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentWall?.wall_number}
                    </h2>
                    {currentWall?.height && currentWall?.width && (
                      <p className="text-sm text-gray-600 mt-1">
                        Altura: {currentWall.height}m | Comprimento: {currentWall.width}m
                      </p>
                    )}
                  </div>
                  {currentWall?.photo_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={currentWall.photo_url} target="_blank" rel="noopener noreferrer">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Ver Foto
                      </a>
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="openings" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="openings">Aberturas</TabsTrigger>
                    <TabsTrigger value="hydraulic">Hidráulica</TabsTrigger>
                    <TabsTrigger value="electrical">Elétrica</TabsTrigger>
                  </TabsList>

                  {/* Aberturas */}
                  <TabsContent value="openings" className="space-y-4">
                    <div className="flex justify-end">
                      <Dialog open={showOpeningDialog} onOpenChange={setShowOpeningDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Abertura
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Nova Abertura</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select
                                value={openingForm.type}
                                onValueChange={(value) =>
                                  setOpeningForm({ ...openingForm, type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="porta">Porta</SelectItem>
                                  <SelectItem value="janela">Janela</SelectItem>
                                  <SelectItem value="passagem">Passagem</SelectItem>
                                  <SelectItem value="vidro_fixo">Vidro Fixo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Largura (m)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={openingForm.width}
                                  onChange={(e) =>
                                    setOpeningForm({ ...openingForm, width: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Altura (m)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={openingForm.height}
                                  onChange={(e) =>
                                    setOpeningForm({ ...openingForm, height: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Altura em relação ao piso (m)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={openingForm.heightFromFloor}
                                onChange={(e) =>
                                  setOpeningForm({
                                    ...openingForm,
                                    heightFromFloor: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Medidas das molduras</Label>
                              <Input
                                value={openingForm.moldingMeasurements}
                                onChange={(e) =>
                                  setOpeningForm({
                                    ...openingForm,
                                    moldingMeasurements: e.target.value,
                                  })
                                }
                                placeholder="Ex: 5cm de cada lado"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Medidas são</Label>
                              <Select
                                value={openingForm.isInternal ? 'internal' : 'external'}
                                onValueChange={(value) =>
                                  setOpeningForm({
                                    ...openingForm,
                                    isInternal: value === 'internal',
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="internal">Internas às molduras</SelectItem>
                                  <SelectItem value="external">Externas às molduras</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Referência</Label>
                                <Select
                                  value={openingForm.referenceSide}
                                  onValueChange={(value) =>
                                    setOpeningForm({ ...openingForm, referenceSide: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="esquerda">Esquerda</SelectItem>
                                    <SelectItem value="direita">Direita</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Distância (m)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={openingForm.distanceFromSide}
                                  onChange={(e) =>
                                    setOpeningForm({
                                      ...openingForm,
                                      distanceFromSide: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <Button onClick={handleAddOpening} className="w-full">
                              Adicionar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {openings.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Nenhuma abertura cadastrada
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {openings.map((opening) => (
                          <Card key={opening.id} className="p-4 border-gray-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold capitalize">{opening.type}</p>
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                  {opening.width && opening.height && (
                                    <p>
                                      Dimensões: {opening.width}m × {opening.height}m
                                    </p>
                                  )}
                                  {opening.height_from_floor && (
                                    <p>Altura do piso: {opening.height_from_floor}m</p>
                                  )}
                                  {opening.distance_from_side && (
                                    <p className="capitalize">
                                      Distância da {opening.reference_side}:{' '}
                                      {opening.distance_from_side}m
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteOpening(opening.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Pontos Hidráulicos */}
                  <TabsContent value="hydraulic" className="space-y-4">
                    <div className="flex justify-end">
                      <Dialog open={showHydraulicDialog} onOpenChange={setShowHydraulicDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Ponto
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Novo Ponto Hidráulico</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select
                                value={hydraulicForm.type}
                                onValueChange={(value) =>
                                  setHydraulicForm({ ...hydraulicForm, type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="entrada_agua">Entrada de Água</SelectItem>
                                  <SelectItem value="saida">Saída</SelectItem>
                                  <SelectItem value="esgoto">Esgoto</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Diâmetro da tubulação</Label>
                              <Input
                                value={hydraulicForm.diameter}
                                onChange={(e) =>
                                  setHydraulicForm({ ...hydraulicForm, diameter: e.target.value })
                                }
                                placeholder="Ex: 1/2 polegada"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Distância da parede lateral (m)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={hydraulicForm.distanceFromSide}
                                onChange={(e) =>
                                  setHydraulicForm({
                                    ...hydraulicForm,
                                    distanceFromSide: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Altura em relação ao piso (m)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={hydraulicForm.heightFromFloor}
                                onChange={(e) =>
                                  setHydraulicForm({
                                    ...hydraulicForm,
                                    heightFromFloor: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <Button onClick={handleAddHydraulic} className="w-full">
                              Adicionar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {hydraulicPoints.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Nenhum ponto hidráulico cadastrado
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {hydraulicPoints.map((point) => (
                          <Card key={point.id} className="p-4 border-gray-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold capitalize">
                                  {point.type.replace('_', ' ')}
                                </p>
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                  {point.diameter && <p>Diâmetro: {point.diameter}</p>}
                                  {point.distance_from_side && (
                                    <p>Distância lateral: {point.distance_from_side}m</p>
                                  )}
                                  {point.height_from_floor && (
                                    <p>Altura do piso: {point.height_from_floor}m</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteHydraulic(point.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Pontos Elétricos */}
                  <TabsContent value="electrical" className="space-y-4">
                    <div className="flex justify-end">
                      <Dialog open={showElectricalDialog} onOpenChange={setShowElectricalDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Ponto
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Novo Ponto Elétrico</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Tipo</Label>
                              <Select
                                value={electricalForm.type}
                                onValueChange={(value) =>
                                  setElectricalForm({ ...electricalForm, type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="tomada">Tomada</SelectItem>
                                  <SelectItem value="interruptor">Interruptor</SelectItem>
                                  <SelectItem value="disjuntor">Disjuntor</SelectItem>
                                  <SelectItem value="antena">Antena</SelectItem>
                                  <SelectItem value="rede">Rede</SelectItem>
                                  <SelectItem value="telefone">Telefone</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Altura em relação ao piso (m)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={electricalForm.heightFromFloor}
                                onChange={(e) =>
                                  setElectricalForm({
                                    ...electricalForm,
                                    heightFromFloor: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Referência</Label>
                                <Select
                                  value={electricalForm.referenceSide}
                                  onValueChange={(value) =>
                                    setElectricalForm({ ...electricalForm, referenceSide: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="esquerda">Esquerda</SelectItem>
                                    <SelectItem value="direita">Direita</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Distância (m)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={electricalForm.distanceFromSide}
                                  onChange={(e) =>
                                    setElectricalForm({
                                      ...electricalForm,
                                      distanceFromSide: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <Button onClick={handleAddElectrical} className="w-full">
                              Adicionar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {electricalPoints.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Nenhum ponto elétrico cadastrado
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {electricalPoints.map((point) => (
                          <Card key={point.id} className="p-4 border-gray-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">
                                  {point.point_number} - {point.type}
                                </p>
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                  {point.height_from_floor && (
                                    <p>Altura do piso: {point.height_from_floor}m</p>
                                  )}
                                  {point.distance_from_side && (
                                    <p className="capitalize">
                                      Distância da {point.reference_side}:{' '}
                                      {point.distance_from_side}m
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteElectrical(point.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </Card>
        </div>

        {/* Botão Gerar PDF */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => toast.info('Funcionalidade de PDF em desenvolvimento')}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Gerar Croqui em PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
