import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin@11'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Client-Info',
}

const firebaseServiceAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
if (!firebaseServiceAccount) {
  console.error('FIREBASE_SERVICE_ACCOUNT no configurada en Secrets')
}

if (firebaseServiceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(firebaseServiceAccount)),
  })
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface TestPayload {
  type: 'quote' | 'tip' | 'activity' | 'minigame' | 'emotion' | 'appointment'
}

function buildTestMessage(type: TestPayload['type']): { title: string; body: string } {
  switch (type) {
    case 'quote':
      return { title: 'Frase motivacional', body: 'Esta es una frase de prueba para verificar las notificaciones.' }
    case 'tip':
      return { title: 'Consejo emocional', body: 'Este es un consejo de prueba. Recuerda tomarte un momento para ti.' }
    case 'activity':
      return { title: 'Actividad de bienestar', body: 'Prueba: Respira profundo y relajate unos segundos.' }
    case 'minigame':
      return { title: 'Minijuego disponible', body: 'Prueba: Un nuevo juego interactivo te espera.' }
    case 'emotion':
      return { title: 'Registro emocional', body: 'Prueba: Como te sientes hoy? Haz tu check-in emocional.' }
    case 'appointment':
      return { title: 'Cita agendada', body: 'Prueba: Tu cita ha sido registrada exitosamente.' }
    default:
      return { title: 'Notificacion de prueba', body: 'Esta es una prueba del sistema de notificaciones.' }
  }
}

async function sendNotifications(type: TestPayload['type']) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    if (error) {
      console.error('send-test-push: error consultando push_tokens:', error.message)
      return
    }

    if (!tokens || tokens.length === 0) {
      console.log('send-test-push: no hay tokens activos')
      return
    }

    const message = buildTestMessage(type)

    const messages = tokens.map((item) => ({
      token: item.token,
      notification: message,
      android: {
        notification: {
          channelId: 'sistema',
          priority: 'high',
          tag: `test-${type}-${Date.now()}`,
        },
      },
      data: {
        type: 'test',
        test_type: type,
        route: '/',
      },
    }))

    const results = await Promise.allSettled(
      messages.map((msg) => admin.messaging().send(msg))
    )
    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    await Promise.all(
      results.map(async (result, index) => {
        if (result.status !== 'rejected') return
        const reason = result.reason
        if (reason?.code === 'messaging/registration-token-not-registered') {
          await supabase
            .from('push_tokens')
            .update({ is_active: false })
            .eq('token', messages[index].token)
        }
      })
    )

    console.log(`send-test-push [${type}]: ${sent} enviadas, ${failed} fallidas, ${tokens.length} tokens`)
  } catch (error) {
    console.error('send-test-push background error:', error.message)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const body: TestPayload = await req.json().catch(() => ({ type: 'quote' as const }))
    const { type } = body

    sendNotifications(type)

    return new Response(JSON.stringify({ sent: 'procesando', message: `Enviando ${type}...` }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: 202,
    })
  } catch (error) {
    console.error('send-test-push error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
