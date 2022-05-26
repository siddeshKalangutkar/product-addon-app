import fetch from "node-fetch";
import { find_access_token } from "../db-fucntion.js"

const SUBSCRIBTION_UPDATE = `
  mutation appSubscriptionLineItemUpdate($cappedAmount: MoneyInput!, $id: ID!) {
    appSubscriptionLineItemUpdate(cappedAmount: $cappedAmount, id: $id) {
      appSubscription {
        id
      }
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`;

const SUBSCRIBTION_DATA = `
  query {
    node(id: "gid://shopify/AppSubscription/26405929219") {
      ...on AppSubscription {
        createdAt
        currentPeriodEnd
        id
        name
        status
        test
        trialDays
        lineItems {
          plan {
            pricingDetails {
              ...on AppRecurringPricing {
                interval
                price {
                  amount
                  currencyCode
                }
  
              }
              ...on AppUsagePricing {
                terms
                cappedAmount {
                  amount
                  currencyCode
  
                }
                balanceUsed {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function updateSubscriptionPlan(shop_domain) {
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
            "id": "gid://shopify/AppSubscriptionLineItem/26405470467?v=1&index=0",
            "cappedAmount": {
                "amount": 20,
                "currencyCode": "USD"
            }
        }
        // param.body = JSON.stringify({ query: SUBSCRIBTION_UPDATE, variables: body_data })
        param.body = JSON.stringify({ query: SUBSCRIBTION_DATA })
        let subscribe_response = await fetch(url, param)
        let subscribe_data = await subscribe_response.json()
        console.log("Subscribe data", JSON.stringify(subscribe_data))
    }
    catch (error) {
        console.log("error for creating subcribtion ", error)
    }
}
updateSubscriptionPlan("simplecheckoutstore.myshopify.com")