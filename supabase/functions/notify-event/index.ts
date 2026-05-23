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

async function sendNotifications(type: string, table: string, record: any) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    if (!tokens || tokens.length === 0) {
      console.log('⚠️ No hay tokens registrados')
      return
    }

    let title = ''
    let bodyMsg = ''

    if (table === 'eventos') {
      const eventoTitle = record.titulo || 'Nuevo evento'
      if (type === 'INSERT') {
        title = '📅 Nuevo evento'
        bodyMsg = `${eventoTitle} — ${record.fecha_inicio ? new Date(record.fecha_inicio).toLocaleDateString('es-CO') : 'Próximamente'}`
      } else if (type === 'UPDATE') {
        if (record.estado === 'cancelado') {
          title = '❌ Evento cancelado'
          bodyMsg = `${eventoTitle} ha sido cancelado`
        } else if (record.estado === 'pospuesto') {
          title = '🔄 Evento pospuesto'
          bodyMsg = `${eventoTitle} ha sido reprogramado`
        } else {
          title = '📅 Evento actualizado'
          bodyMsg = `${eventoTitle} — Revisa los cambios`
        }
      }
    }

    const messages = tokens.map(t => ({
      token: t.token,
      notification: { title, body: bodyMsg },
      android: {
        notification: {
          channelId: 'eventos',
          priority: 'high',
        },
      },
    }))

    const sendResults = await Promise.allSettled(
      messages.map(msg => admin.messaging().send(msg))
    )

    const sent = sendResults.filter(r => r.status === 'fulfilled').length
    const failed = sendResults.filter(r => r.status === 'rejected').length

    console.log(`✅ Notificaciones enviadas: ${sent}, fallidas: ${failed}`)
  } catch (error) {
    console.error('❌ Error en background:', error.message)
  }
}

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, table, record } = body

    console.log(`📩 Webhook recibido: ${type} en ${table}`)

    // Respondemos 202 Accepted inmediatamente para evitar 504
    sendNotifications(type, table, record)

    return new Response(null, { status: 202 })
  } catch (error) {
    console.error('❌ Error en handler:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
