import fetch from "node-fetch";
import {find_access_token} from "../db-fucntion.js"

const SUBSCRIBTION = `
  mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int, $test: Boolean ){
    appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, trialDays: $trialDays, test: $test) {
      userErrors {
        field
        message
      }
      appSubscription {
        id
        lineItems{
            id
        }
      }
      confirmationUrl
    }
  }
`;

export async function createSubscription(shop_domain) {
    try {
        let { accessToken } = await find_access_token(shop_domain)
        let url = `https://${shop_domain}/admin/api/2022-04/graphql.json`;
        let param = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            }
        }
        let body_data = {
            "name": "Super Trial",
            "returnUrl": `https://${shop_domain}/admin/apps/product_addons_app`,
            "trialDays": 7,
            "test": true,
            "lineItems": [
                {
                    "plan": {
                        "appRecurringPricingDetails": {
                            "price": {
                                "amount": 10,
                                "currencyCode": "USD"
                            },
                            "interval" : "EVERY_30_DAYS"
                        }
                    }
                }
            ]
        }
        param.body = JSON.stringify({ query: SUBSCRIBTION, variables: body_data })
        let subscribe_response = await fetch(url, param)
        let subscribe_data = await subscribe_response.json()
        console.log("Subscribe data", JSON.stringify(subscribe_data))
    }
    catch (error) {
        console.log("error for creating subcribtion ", error)
    }
}
createSubscription("simplecheckoutstore.myshopify.com")