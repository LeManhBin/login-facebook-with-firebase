import type { NextApiRequest, NextApiResponse } from 'next';
import { useState } from 'react';
import axios from 'axios';
import request from "request";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
require('dotenv').config();

export default function userHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const [result, setResult] = useState("")
  const fetchData = async (payload:string) => {
    const res =  await axios.post('https://bot.botlly.com/api/turbo', payload,
    {
      headers: {
        'x-api-key' : "qkx8xfzhqQAn1KhJjfyNT3BlbkFy4" ,
      },
    })
    if(res.status === 200) {
      setResult(res.data.choices[0].message.content)
    }else {
      console.log("Error");
      
    }
    
    return res.data.choices[0].message.content
  }

  const { query, method } = req
  const id = parseInt(query.id as any, 10)
  const name = query.name as any
  
  async function handleMessage(sender_psid:any, received_message:any) {
    let response;
    const prompt:string = received_message.text
    await fetchData(prompt)
    // Checks if the message contains text
    if (received_message.text) {
      response = {
        text: result,
      };
    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: "Đây có phải ảnh của bạn không?",
                subtitle: "Tap a button to answer.",
                image_url: attachment_url,
                buttons: [
                  {
                    type: "postback",
                    title: "Có!",
                    payload: "yes",
                  },
                  {
                    type: "postback",
                    title: "Không!",
                    payload: "no",
                  },
                ],
              },
            ],
          },
        },
      };
    }
  
    // Send the response message
    callSendAPI(sender_psid, response);
  }
  
  function callSendAPI(sender_psid:any, response:any) {
    // Construct the message body
    let request_body = {
      recipient: {
        id: sender_psid,
      },
      message: response,
    };
  
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body,
      },
      (err:any, res:any, body:any) => {
        if (!err) {
          console.log("message sent!");
        } else {
          console.error("Unable to send message:" + err);
        }
      }
    );
  }
  
  function handlePostback(sender_psid:any, received_postback:any) {
    let response;
  
    // Get the payload for the postback
    let payload:any = received_postback.payload;
  
    // Set the response based on the postback payload
    if (payload === "yes") {
      response = { text: "Thanks!" };
    } else if (payload === "no") {
      response = { text: "Oops, try sending another image." };
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }
  switch (method) {
    case 'GET':
      let mode = req.query["hub.mode"];
      let token = req.query["hub.verify_token"];
      let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query any of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).json({challenge: challenge});
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        res.status(403);
      }
    }
      break
    case 'POST':
      let body = req.body;

      if (body.object === "page") {
        body.entry.forEach(function (entry:any) {
          // Gets the body of the webhook event
          let webhook_event = entry.messaging[0];
          console.log(webhook_event);
  
          // Get the sender PSID
          let sender_psid = webhook_event.sender.id;
          console.log("Sender PSID: " + sender_psid);
  
          // Check if the event is a message or postback and
          // pass the event to the appropriate handler function
          if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);
          } else if (webhook_event.postback) {
            handlePostback(sender_psid, webhook_event.postback);
          }
        });
  
        res.status(200).send("EVENT_RECEIVED");
      } else {
        res.status(404);
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}