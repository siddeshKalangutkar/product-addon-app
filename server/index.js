// @ts-check
import { resolve } from "path";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";

const USE_ONLINE_TOKENS = true;
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";

const PORT = parseInt(process.env.PORT || "8081", 10);
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

import crypto from 'crypto';

import cors from "cors";
import draft_checkout from "./api/draftOrder.js";
import { find_access_token, update_rule, get_rules, delete_rule, update_subscription_plan, find_account } from "./db-fucntion.js"
import { clear_data, clear_rules } from "./api/clearData.js"
import { createSubscription } from "./api/createSubscribtion.js"

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.April22,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/webhooks",
  webhookHandler: async (topic, shop, body) => {
    delete ACTIVE_SHOPIFY_SHOPS[shop];
  },
});
Shopify.Webhooks.Registry.addHandler("APP_SUBSCRIPTIONS_UPDATE", {
  path: "/plan-subscribe",
  webhookHandler: async (topic, shop, body) => {
    let data = JSON.parse(body)
    data.app_subscription.status == "ACTIVE" ? await update_subscription_plan(shop, data.app_subscription.name, data.app_subscription.admin_graphql_api_id) : "";
  },
});

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const app = express();
  app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
  app.set("active-shopify-shops", ACTIVE_SHOPIFY_SHOPS);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);

  app.post("/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
      await clear_data(req.headers['x-shopify-shop-domain'])
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
      res.status(500).send(error.message);
    }
  });

  app.post("/plan-subscribe", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Subscribe Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process subscribe webhook: ${error}`);
      res.status(500).send(error.message);
    }
  });

  app.get("/get-account", verifyRequest(app), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, true);
      const data = await find_account(session.shop)
      res.status(200).send(data.data);
    }
    catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get("/products-count", verifyRequest(app), async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.post("/graphql", verifyRequest(app), async (req, res) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.use(express.json());

  app.use((req, res, next) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${shop} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  // app.post("/api/checkout", cors(), async (req, res) => {
  //   try {
  //     let { accessToken } = await find_access_token(req.body.shop)
  //     let url_data = await draft_checkout(req.body.data, accessToken)
  //     console.log('Check API successfull')
  //     res.json({ url: url_data })
  //   }
  //   catch (err) {
  //     console.log('Error at Checkout API', err)
  //     res.json({ error: err })
  //   }
  // });

  app.get("/get-shop", verifyRequest(app), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, true);
      res.status(200).send({ shop: session.shop })
    }
    catch (err) {
      console.log('Error at getting shop name', err)
      res.status(500).send({ error: err })
    }
  });

  app.post("/update-rule", async (req, res) => {
    try {
      let response_data = await update_rule(req.body)
      res.json(response_data)
    }
    catch (err) {
      console.log('Error at Update Rule API', err)
      res.json({ error: err })
    }
  });

  app.post("/get-rules", async (req, res) => {
    try {
      let response_data = await get_rules(req.body.shop)
      res.json(response_data)
    }
    catch (err) {
      console.log('Error at getting rule data', err)
      res.json({ error: err })
    }
  });

  app.post("/delete-rule", async (req, res) => {
    try {
      let response_data = await delete_rule(req.body)
      res.json(response_data)
    }
    catch (err) {
      console.log('Error at deleting rule data', err)
      res.json({ error: err })
    }
  });

  app.post("/delete-all-rules", verifyRequest(app), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, true);
      await clear_rules(session.shop)
      res.status(200).send({ sucess: true })
    }
    catch (err) {
      console.log('Error at getting deleting all rules', err)
      res.status(500).send({ error: err })
    }
  });

  app.get("/create-charge", verifyRequest(app), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, true);
      let result = await createSubscription(session.shop, false)
      if (result.success == true) {
        res.status(200).send({success: true, data: result.data})
      }
      else {
        throw result.data;
      }
    }
    catch (err) {
      console.log('Error creating charge', err)
      res.status(500).send({ success: true, error: err })
    }
  });

  app.get("/create-trial-charge", verifyRequest(app), async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(req, res, true);
      let result = await createSubscription(session.shop, true)
      if (result.success == true) {
        res.status(200).send({success: true, data: result.data})
      }
      else {
        throw result.data;
      }
    }
    catch (err) {
      console.log('Error creating trial charge', err)
      res.status(500).send({ success: true, error: err })
    }
  });

  function verifyWebhookRequest(req, res, next) {
    try {
      const generatedHash = crypto.createHmac('SHA256', Shopify.Context.API_SECRET_KEY).update(JSON.stringify(req.body), 'utf8').digest('base64');
      //const hmac = req.get(ShopifyHeader.Hmac); // Equal to 'X-Shopify-Hmac-Sha256' at time of coding req.headers['x-shopify-shop-domain']
      const hmac = typeof req.headers['X-Shopify-Hmac-Sha256'] != "undefined" ? req.headers['X-Shopify-Hmac-Sha256'] : "";
      console.log("header", req.headers)
      console.log("header hmac", req.headers['X-Shopify-Hmac-Sha256'])

      const safeCompareResult = Shopify.Utils.safeCompare(generatedHash, hmac);

      if (!!safeCompareResult) {
        console.log('hmac verified for webhook route, proceeding');
        next();
      } else {
        console.log('Shopify hmac verification for webhook failed, aborting');
        return res.status(401).json({ succeeded: false, message: 'Not Authorized' }).send();
      }   
    } catch(error) {
      console.log(error);
      return res.status(401).json({ succeeded: false, message: 'Error caught' }).send();
    }
  }

  app.post('/customer/request', verifyWebhookRequest, async(req, res) => {
    res.status(200).send();
  });

  app.post('/customer/delete', verifyWebhookRequest, async(req, res) => {
    res.status(200).send();
  });

  app.post('/shop/delete', verifyWebhookRequest, async(req, res) => {
    res.status(200).send();
    await clear_data(req.headers['x-shopify-shop-domain'])
  });

  app.use("/*", (req, res, next) => {
    const { shop } = req.query;

    // Detect whether we need to reinstall the app, any request from Shopify will
    // include a shop in the query parameters.
    if (app.get("active-shopify-shops")[shop] === undefined && shop) {
      res.redirect(`/auth?${new URLSearchParams(req.query).toString()}`);
    } else {
      next();
    }
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await import("vite").then(({ createServer }) =>
      createServer({
        root,
        logLevel: isTest ? "error" : "info",
        server: {
          port: PORT,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 64999,
            clientPort: 64999,
          },
          middlewareMode: "html",
        },
      })
    );
    app.use(vite.middlewares);
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");
    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      // Client-side routing will pick up on the correct route to render, so we always render the index here
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${process.cwd()}/dist/client/index.html`));
    });
  }

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) => app.listen(PORT));
}
