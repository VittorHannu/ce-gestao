// supabase/functions/process-notification-queue/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

// Headers para permitir chamadas (CORS)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuração do Web-Push com as chaves VAPID lidas do ambiente
const vapidEmail = Deno.env.get('VAPID_CONTACT_EMAIL')
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') // A chave pública também é necessária aqui
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)

// Função principal que é servida
Deno.serve(async (req) => {
  // Tratamento de chamada pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Cria um cliente Supabase com a role de serviço para ter acesso total
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Buscar tarefas pendentes na fila
    const { data: queueTasks, error: queueError } = await supabaseClient
      .from('notification_queue')
      .select('*')
      .eq('status', 'PENDING')
      .limit(10) // Processa até 10 por vez para não sobrecarregar

    if (queueError) throw queueError

    if (!queueTasks || queueTasks.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending notifications.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Processa cada tarefa em paralelo
    const processingPromises = queueTasks.map(async (task) => {
      try {
        // Marca a tarefa como em processamento
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'PROCESSING', attempts: task.attempts + 1, last_attempt_at: new Date().toISOString() })
          .eq('id', task.id)

        // 2. Buscar as preferências do usuário
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('notification_preferences')
          .eq('id', task.recipient_user_id)
          .single()

        if (profileError) throw new Error(`Profile not found for user ${task.recipient_user_id}`)

        // 3. Montar a mensagem e verificar se o usuário quer receber este tipo
        let messageTitle = ''
        let messageBody = ''
        let wantsNotification = false

        if (task.notification_type === 'NEW_ASSIGNMENT') {
          messageTitle = 'Novo Relato Atribuído!'
          messageBody = `O relato ${task.payload.relato_id} foi atribuído a você.`
          wantsNotification = profile.notification_preferences?.new_report_assigned ?? true
        } else if (task.notification_type === 'NEW_COMMENT') {
          messageTitle = 'Novo Comentário no Relato!'
          messageBody = `Um novo comentário foi adicionado ao relato ${task.payload.relato_id}: "${task.payload.comment_text}"`
          wantsNotification = profile.notification_preferences?.new_comment_on_report ?? true
        }
        // Adicionar outros `if` para outros tipos de notificação aqui no futuro

        if (!wantsNotification) {
          // Marca como processado (ignorado) se o usuário não quer receber
          await supabaseClient.from('notification_queue').update({ status: 'PROCESSED' }).eq('id', task.id)
          return // Pula para a próxima tarefa
        }

        // 4. Buscar os endereços de notificação do usuário
        const { data: subscriptions, error: subsError } = await supabaseClient
          .from('push_subscriptions')
          .select('subscription_data')
          .eq('user_id', task.recipient_user_id)

        if (subsError) throw subsError

        if (!subscriptions || subscriptions.length === 0) {
          // Se não há inscrições, não há onde entregar. Marca como falha.
          throw new Error(`No push subscriptions found for user ${task.recipient_user_id}`)
        }

        // 5. Enviar a notificação para cada endereço
        const payload = JSON.stringify({ title: messageTitle, body: messageBody, data: task.payload })
        const sendPromises = subscriptions.map(sub => webpush.sendNotification(sub.subscription_data, payload))
        await Promise.all(sendPromises)

        // 6. Marcar como sucesso
        await supabaseClient.from('notification_queue').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('id', task.id)

      } catch (err) {
        // Se qualquer passo falhar, marca a tarefa com erro
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'FAILED', error_message: err.message })
          .eq('id', task.id)
        console.error(`Failed to process task ${task.id}:`, err)
      }
    })

    await Promise.all(processingPromises)

    return new Response(JSON.stringify({ message: "Queue processed successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})