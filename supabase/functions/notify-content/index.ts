import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin@11'

const firebaseServiceAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
if (!firebaseServiceAccount) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT no configurada en Secrets')
}

if (firebaseServiceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseServiceAccount)),
  })
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ContentMessage {
  title: string
  body: string
  channelId: string
  data?: Record<string, string>
}

function buildMessage(type: string, table: string, record: any): ContentMessage | null {
  switch (table) {
    case 'noticias':
      if (type === 'INSERT') {
        return {
          title: '📰 Nueva noticia',
          body: record.titulo || 'Nuevo artículo publicado',
          channelId: 'noticias',
          data: { route: `/noticia/${record.slug || ''}`, table },
        }
      }
      return null

    case 'motivational_quotes':
      if (type === 'INSERT') {
        return {
          title: '✨ Nueva frase motivacional',
          body: record.author ? `"${(record.quote || '').slice(0, 80)}..." — ${record.author}` : 'Nueva frase disponible',
          channelId: 'frases',
          data: { table },
        }
      }
      return null

    case 'emotional_tips':
      if (type === 'INSERT') {
        return {
          title: '💡 Nuevo consejo emocional',
          body: record.title || 'Nuevo consejo de bienestar disponible',
          channelId: 'consejos',
          data: { table },
        }
      }
      return null

    case 'wellness_activities':
      if (type === 'INSERT') {
        return {
          title: '🧘 Nueva actividad',
          body: record.title || 'Nueva actividad de bienestar disponible',
          channelId: 'actividades',
          data: { table },
        }
      }
      return null

    case 'mini_games':
      if (type === 'INSERT') {
        return {
          title: '🎮 Nuevo minijuego',
          body: record.title || 'Nuevo minijuego disponible',
          channelId: 'minijuegos',
          data: { table },
        }
      }
      return null

    case 'emotions':
      if (type === 'INSERT') {
        return {
          title: '😌 Nueva emoción',
          body: record.emotion_name || 'Nueva categoría emocional agregada',
          channelId: 'emociones',
          data: { table },
        }
      }
      return null

    default:
      return null
  }
}

async function sendNotifications(type: string, table: string, record: any) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    if (error) {
      console.error('❌ Error consultando push_tokens:', error.message)
      return
    }

    if (!tokens || tokens.length === 0) {
      console.log(`⚠️ notify-content [${table}]: No hay tokens registrados`)
      return
    }

    const msg = buildMessage(type, table, record)
    if (!msg) {
      console.log(`ℹ️ notify-content [${table}]: No se generó mensaje para ${type}`)
      return
    }

    const messages = tokens.map(t => ({
      token: t.token,
      notification: { title: msg.title, body: msg.body },
      android: {
        notification: {
          channelId: msg.channelId,
          priority: 'high',
          tag: `${table}-${record.id || Date.now()}`,
        },
      },
      data: msg.data || {},
    }))

    // Enviar en lotes de 500 (límite de Firebase)
    const batchSize = 500
    let sent = 0
    let failed = 0

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      const results = await Promise.allSettled(
        batch.map(m => admin.messaging().send(m))
      )
      sent += results.filter(r => r.status === 'fulfilled').length
      failed += results.filter(r => r.status === 'rejected').length
    }

    // Desactivar tokens fallidos con error de registro
    for (const result of messages.map((m, i) => ({ msg: m, idx: i }))) {
      const r = await admin.messaging().send(result.msg).catch(e => e)
      if (r?.code === 'messaging/registration-token-not-registered') {
        await supabase
          .from('push_tokens')
          .update({ is_active: false })
          .eq('token', result.msg.token)
        console.log(`🗑️ Token inválido desactivado: ${result.msg.token.slice(0, 20)}...`)
      }
    }

    console.log(`✅ notify-content [${table}]: ${sent} enviadas, ${failed} fallidas, ${tokens.length} tokens total`)
  } catch (error) {
    console.error(`❌ Error en notify-content [${table}]:`, error.message)
  }
}

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, table, record } = body

    console.log(`📩 notify-content webhook: ${type} en ${table}`)

    // Responder 202 inmediatamente
    sendNotifications(type, table, record)

    return new Response(null, { status: 202 })
  } catch (error) {
    console.error('❌ Error en handler notify-content:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
