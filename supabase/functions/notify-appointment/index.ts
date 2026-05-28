import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import admin from 'npm:firebase-admin@11'

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

function buildAppointmentMessage(record: any): { title: string; body: string } | null {
  const userName = record.user_name || 'Tu cita'

  switch (record.status) {
    case 'pendiente':
      return {
        title: 'Solicitud recibida',
        body: `${userName}, tu solicitud de cita fue recibida. Te contactaremos pronto.`,
      }
    case 'confirmada':
      return {
        title: 'Cita confirmada',
        body: `${userName}, tu cita del ${record.requested_date} a las ${record.requested_time || 'hora acordada'} fue confirmada.`,
      }
    case 'cancelada':
      return {
        title: 'Cita cancelada',
        body: `${userName}, tu cita del ${record.requested_date} ha sido cancelada.`,
      }
    case 'completada':
      return {
        title: 'Cita completada',
        body: `${userName}, gracias por asistir a tu cita. Esperamos que te haya sido util.`,
      }
    case 'reagendada':
      return {
        title: 'Cita reagendada',
        body: `${userName}, tu cita fue reagendada para el ${record.requested_date} a las ${record.requested_time || 'hora acordada'}.`,
      }
    default:
      return null
  }
}

async function sendNotifications(type: string, table: string, record: any) {
  if (table !== 'appointments') return

  const userId = record.user_id
  if (!userId) {
    console.log(`notify-appointment: cita ${record.id || 'sin id'} sin user_id; no se envia broadcast`)
    return
  }

  const message = buildAppointmentMessage(record)
  if (!message) {
    console.log(`notify-appointment: estado sin mensaje (${record.status})`)
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('is_active', true)
      .eq('user_id', userId)

    if (error) {
      console.error('notify-appointment: error consultando push_tokens:', error.message)
      return
    }

    if (!tokens || tokens.length === 0) {
      console.log(`notify-appointment: no hay tokens activos para user_id=${userId}`)
      return
    }

    const messages = tokens.map((item) => ({
      token: item.token,
      notification: message,
      android: {
        notification: {
          channelId: 'citas',
          priority: 'high',
          tag: `appointment-${record.id || Date.now()}`,
        },
      },
      data: {
        table,
        type,
        appointment_id: String(record.id || ''),
        user_id: String(userId),
        route: '/agenda',
      },
    }))

    const results = await Promise.allSettled(messages.map((msg) => admin.messaging().send(msg)))
    const sent = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.filter((result) => result.status === 'rejected').length

    await Promise.all(results.map(async (result, index) => {
      if (result.status !== 'rejected') return
      const reason = result.reason
      if (reason?.code === 'messaging/registration-token-not-registered') {
        await supabase
          .from('push_tokens')
          .update({ is_active: false })
          .eq('token', messages[index].token)
      }
    }))

    console.log(`notify-appointment [${record.id || 'sin id'}]: ${sent} enviadas, ${failed} fallidas, ${tokens.length} tokens del usuario`)
  } catch (error) {
    console.error('notify-appointment: error en background:', error.message)
  }
}

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, table, record } = body

    console.log(`notify-appointment webhook: ${type} en ${table}`)
    sendNotifications(type, table, record)

    return new Response(null, { status: 202 })
  } catch (error) {
    console.error('notify-appointment handler:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
