const  express = require('express')
const CryptoJS = require('crypto-js')
const webhookRouter = express.Router()


const verifySignature = (req,res,next) => {
  const hmac_message = req.headers['Twitch-Eventsub-Message-Id'] + req.headers['Twitch-Eventsub-Message-Timestamp'] + JSON.stringify(req.body)
  const hash = CryptoJS.HmacSHA256(hmac_message, 'chance_webhook_secret')
  const expected_signature_header = 'sha256=' + hash

  if (req.headers['Twitch-Eventsub-Message-Signature'] != expected_signature_header) {
    next()
  }
  else {
    res.sendStatus(403)
  }
}

webhookRouter.post('/follow', verifySignature, async (request, response) => {
  if(request.body.challenge) {
    response.status(200).send(request.body.challenge)
  }
  else {
    const badPatterns = [/hoss\d+_\w+/, /ho\d+ss/, /gun\w{2}/]
    const userLogin = request.body.event.user_login
    console.log('NEW FOLLOWER: ', userLogin)
    if (badPatterns.some(pattern => pattern.test(userLogin))) {
        console.log('BANNING USER')
    }
    response.sendStatus(200)
  }
})

module.exports = {webhookRouter}