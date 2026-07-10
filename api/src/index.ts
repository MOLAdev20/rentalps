import app from './app.js'

import env from './config/env.js'

app.listen(env.PORT || 8080, () => {
  console.log(`🚀 API Server is Running! on port ${env.PORT}`)
})