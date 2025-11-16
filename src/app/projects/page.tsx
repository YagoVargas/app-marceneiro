'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FolderOpen, Eye } from 'lucide-react'
import { supabase, type Project } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProjects(data)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      briefing: 'Em Briefing',
      measuring: 'Medindo',
      awaiting_quote: 'Aguardando Orçamento',
      completed: 'Finalizado',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      briefing: 'bg-blue-100 text-blue-800',
      measuring: 'bg-yellow-100 text-yellow-800',
      awaiting_quote: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
            <FolderOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Projetos Salvos</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum projeto cadastrado</p>
            <Button
              onClick={() => router.push('/projects/new')}
              className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              Criar Primeiro Projeto
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}/briefing`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {project.name}
                      </h3>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Código: <span className="font-mono font-medium">{project.code}</span>
                    </p>
                    {project.client && (
                      <p className="text-sm text-gray-600">
                        Cliente: {project.client.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Criado em{' '}
                      {format(new Date(project.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
