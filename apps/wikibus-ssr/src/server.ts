/* eslint-disable no-console */
import * as roadshow from '@hydrofoil/roadshow-ssr'
import './viewers.js'
import express from 'express'
import log from 'loglevel'

log.enableAll()

export async function render({ res }: { res: express.Response }) {
  const pointer = res.locals.resource

  console.log(`Rendering ${pointer.value}`)
  return roadshow.render({
    pointer,
  })
}
