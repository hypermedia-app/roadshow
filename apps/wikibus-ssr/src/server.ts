import 'anylogger-console'
import * as roadshow from '@hydrofoil/roadshow-ssr'
import express from 'express'
import log from 'anylogger'
import './viewers.js'

export async function render({ res }: { res: express.Response }) {
  const pointer = res.locals.resource

  if (!pointer) {
    return 'Not found'
  }

  log('wikibus').info(`Rendering ${pointer.value}`)
  return roadshow.render({
    pointer,
  })
}
