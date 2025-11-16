import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Client = {
  id: string
  name: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export type Appointment = {
  id: string
  client_id: string
  environment_type?: string
  scheduled_date: string
  rescheduled_date?: string
  notes?: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  client?: Client
}

export type Project = {
  id: string
  code: string
  name: string
  client_id?: string
  status: 'briefing' | 'measuring' | 'awaiting_quote' | 'completed'
  created_at: string
  updated_at: string
  client?: Client
}

export type ProjectEnvironment = {
  id: string
  project_id: string
  name: string
  type?: string
  created_at: string
}

export type Module = {
  id: string
  environment_id: string
  name: string
  has_doors: boolean
  door_count: number
  door_type?: 'lisa' | 'provencal' | 'vidro'
  countertop_type?: 'marmore' | 'granito' | 'mdf'
  preferences?: string
  hardware?: {
    dobradica?: boolean
    amortecida?: boolean
    corredica_telescopica?: boolean
    corredica_oculta?: boolean
    cantoneiras?: boolean
    puxadores?: string
  }
  created_at: string
}

export type Wall = {
  id: string
  environment_id: string
  wall_number: string
  photo_url?: string
  height?: number
  width?: number
  created_at: string
}

export type Opening = {
  id: string
  wall_id: string
  type: 'porta' | 'janela' | 'passagem' | 'vidro_fixo'
  width?: number
  height?: number
  height_from_floor?: number
  molding_measurements?: string
  is_internal?: boolean
  distance_from_side?: number
  reference_side?: 'esquerda' | 'direita'
  created_at: string
}

export type HydraulicPoint = {
  id: string
  wall_id: string
  type: 'entrada_agua' | 'saida' | 'esgoto'
  diameter?: string
  distance_from_side?: number
  height_from_floor?: number
  created_at: string
}

export type ElectricalPoint = {
  id: string
  wall_id: string
  type: 'tomada' | 'interruptor' | 'disjuntor' | 'antena' | 'rede' | 'telefone'
  point_number: string
  height_from_floor?: number
  distance_from_side?: number
  reference_side?: 'esquerda' | 'direita'
  created_at: string
}

export type GeneralPhoto = {
  id: string
  environment_id: string
  photo_url: string
  category?: 'visao_geral' | 'detalhes' | 'pontos_importantes'
  description?: string
  created_at: string
}

export type Observation = {
  id: string
  project_id: string
  content: string
  created_at: string
}
