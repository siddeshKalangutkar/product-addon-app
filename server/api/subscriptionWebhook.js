import fetch from "node-fetch";
import "dotenv/config";

const URL = process.env.HOST;

const PLAN_SUBCRIPTION = `
  mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
        topic
        format
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
    }
  }
`;

export default async function planSubscription(accessToken, shop_domain) {
    try {
        let url = `https://${shop_domain}/admin/api/2022-04/graphql.json`;
        let param = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            }
        }
        let body_data = {
            "topic": "APP_SUBSCRIPTIONS_UPDATE",
            "webhookSubscription": {
                "callbackUrl": `${URL}/subscribed`,
                "format": "JSON"
            }
        }
        param.body = JSON.stringify({ query: PLAN_SUBCRIPTION, variables: body_data })
        let subscribe_response = await fetch(url, param)
        let subscribe_data = await subscribe_response.json()
        console.log("Subscribe to plan webhook", JSON.stringify(subscribe_data))
    }
    catch (error) {
        console.log("error for plan webhook subcription ", error)
    }
}