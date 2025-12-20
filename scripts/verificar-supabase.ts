/**
 * Script para verificar la configuración de Supabase Storage
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Verificando configuración de Supabase Storage...\n')

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL no está configurado')
  console.log('   Agrega esta variable en .env.local:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co\n')
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurado')
  console.log('   Agrega esta variable en .env.local:')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key\n')
} else {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', supabaseKey.substring(0, 20) + '...')
}

if (supabaseUrl && supabaseKey) {
  console.log('\n✅ Configuración completa!')
  console.log('\n📋 Próximos pasos:')
  console.log('   1. Ve a Supabase Dashboard → Storage')
  console.log('   2. Crea un bucket llamado "productos"')
  console.log('   3. Márcalo como público')
  console.log('   4. Reinicia el servidor (npm run dev)\n')
} else {
  console.log('\n❌ Configuración incompleta')
  console.log('   Consulta CONFIGURAR_SUPABASE_STORAGE.md para más información\n')
}






