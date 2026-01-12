"use strict";

require("dotenv").config(); // for .env support

// WhatsApp token (from Meta Developer Dashboard → App → WhatsApp → API setup)
const token = process.env.WHATSAPP_TOKEN;

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;

const app = express().use(bodyParser.json());

// Start Server
app.listen(process.env.PORT || 10000, () => {
  console.log("Webhook server running...");
});


// ✅ POST Webhook (Incoming Messages)
app.post("/webhook", async (req, res) => {
  try {
    console.log("===== Incoming Webhook =====");
console.log(JSON.stringify(req.body, null, 2));

if (
    req.body.object &&
    req.body.entry &&
    req.body.entry[0].changes &&
    req.body.entry[0].changes[0].value.messages &&
    req.body.entry[0].changes[0].value.messages[0].type === "text"
) {

  const value = req.body.entry[0].changes[0].value;
  const message = value.messages[0];

  const phone_number_id = value.metadata.phone_number_id;
  const from = message.from;
  const msg_body = message.text.body;

  console.log("PHONE:", phone_number_id);
  console.log("FROM:", from);
  console.log("MESSAGE:", msg_body);

  // ✅ SEND AUTOMATIC REPLAY TEXT TO WHATSAPP
  /*try {
    await axios.post(
        `https://graph.facebook.com/v20.0/${phone_number_id}/messages?access_token=${token}`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Message received successfully"
          }
        }
    );
  } catch (error) {
    console.error("❌ ERROR sending reply to WhatsApp:", error.response?.data || error);
  }*/

  // ✅ SEND YOUR DATA TO YOUR DOMAIN URL
  try {
    await axios.post(
        "https://developer.leaddial.co/developer/tenant/whatsapp-message-receive",
        { app_data: req.body }
    );
  } catch (error) {
    console.error("❌ ERROR sending data to domain:");
  }
  
  try {
    await axios.post(
        "https://ma.leaddial.co/tenant/whatsapp-message-receive",
        { app_data: req.body }
    );
  } catch (error) {
    console.error("❌ ERROR sending data to domain:");
  }

} else {
  console.log("⚠️ No text message found or invalid structure.");
}

return res.sendStatus(200);

} catch (err) {
  console.error("💥 MAIN WEBHOOK ERROR:");
  return res.sendStatus(500);
}
});


// ✅ GET Webhook Verification (Meta Setup)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "9b988263f14deca34e84435b6e8e1d0e";  // ✅ MUST BE STRING

const mode = req.query["hub.mode"];
console.log(mode)
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED SUCCESSFULLY");
    return res.status(200).send(challenge);
  } else {
    console.log("Verification token mismatch");
    return res.sendStatus(403);
  }
}

res.sendStatus(403);
});
