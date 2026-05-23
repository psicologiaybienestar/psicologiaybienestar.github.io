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

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, table, record } = body

    console.log(`📩 Webhook citas: ${type} en ${table}`)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
    }

    let title = ''
    let bodyMsg = ''
    const userName = record.user_name || ''

    if (table === 'appointments') {
      switch (record.status) {
        case 'pendiente':
          title = '📋 Solicitud recibida'
          bodyMsg = `${userName}, tu solicitud de cita fue recibida. Te contactaremos pronto.`
          break
        case 'confirmada':
          title = '✅ Cita confirmada'
          bodyMsg = `${userName}, tu cita del ${record.requested_date} a las ${record.requested_time} fue confirmada.`
          break
        case 'cancelada':
          title = '❌ Cita cancelada'
          bodyMsg = `${userName}, tu cita del ${record.requested_date} ha sido cancelada.`
          break
        case 'completada':
          title = '🎉 Cita completada'
          bodyMsg = `${userName}, gracias por asistir a tu cita. Esperamos que te haya sido útil.`
          break
        case 'reagendada':
          title = '🔄 Cita reagendada'
          bodyMsg = `${userName}, tu cita fue reagendada para el ${record.requested_date} a las ${record.requested_time}.`
          break
      }
    }

    const messages = tokens.map(t => ({
      token: t.token,
      notification: { title, body: bodyMsg },
      android: {
        notification: {
          channelId: 'citas',
          priority: 'high',
        },
      },
    }))

    const sendResults = await Promise.allSettled(
      messages.map(msg => admin.messaging().send(msg))
    )

    const sent = sendResults.filter(r => r.status === 'fulfilled').length
    const failed = sendResults.filter(r => r.status === 'rejected').length

    console.log(`✅ Notificaciones de cita: ${sent} enviadas, ${failed} fallidas`)
    return new Response(JSON.stringify({ sent, failed }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
