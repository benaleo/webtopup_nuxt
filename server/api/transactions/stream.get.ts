import { eventHandler, getQuery, setHeader } from 'h3'
import type { H3Event } from 'h3'
import { eventBus } from '~~/server/utils/events'

function writeSSE(event: H3Event, data: any) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  // Default event: message
  // Write with data field only
  // Each message must end with a blank line
  // @ts-ignore access res
  event.node.res.write(`data: ${payload}\n\n`)
}

export default eventHandler(async (event) => {
  const q = getQuery(event)
  const invoiceFilter = (q.invoice as string) || ''

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')

  // @ts-ignore
  event.node.res.flushHeaders?.()

  const off = eventBus.on('transaction_update', (payload: any) => {
    if (invoiceFilter && payload?.invoice !== invoiceFilter) return
    writeSSE(event, payload)
  })

  // Send a ping/hello
  writeSSE(event, { hello: true })

  // Cleanup on client disconnect
  // @ts-ignore
  event.node.req.on('close', () => {
    off()
  })
})
