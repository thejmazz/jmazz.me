'use strict'

const dotenv = require('dotenv')
const envalid = require('envalid')
const { num, str } = envalid

// Load .env into process.env
dotenv.config()

// Sanitized configuration
const config = envalid.cleanEnv(process.env, {
  SSR_HOST: str(),
  SSR_PORT: num()
})

module.exports = config
