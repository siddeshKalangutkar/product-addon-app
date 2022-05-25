import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  Provider as AppBridgeProvider,
  useAppBridge,
} from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { AppProvider as PolarisProvider, Card, Tabs, Page } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import "./assets/style.css";

import { useState, useCallback } from "react";

// import { HomePage } from "./components/HomePage";
// import { EmptyStatePage } from "./components/EmptyStatePage";
// import { ProductsPage } from "./components/ProductsPage";
import { Dashboard } from "./components/Dashboard";
import {Guide} from "./components/Guide"

export default function App() {
  const [selection, setSelection] = useState([]);
  
  const [selected, setSelected] = useState(0);
  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );
  const tabs = [
    {
      id: 'dashboard',
      content: 'Dashboard',
      panelID: 'dashboard',
    },
    {
      id: 'install',
      content: 'Installation Guide',
      panelID: 'install'
    }
  ]

  return (
    <PolarisProvider i18n={translations}>
      <AppBridgeProvider
        config={{
          apiKey: process.env.SHOPIFY_API_KEY,
          host: new URL(location).searchParams.get("host"),
          forceRedirect: true,
        }}
      >
        <MyProvider>
          {/* <HomePage /> */}
          {/* {selection.length > 0 ? (
            <ProductsPage productIds={selection} />
          ) : (
            <EmptyStatePage setSelection={setSelection} />
          )} */}
          <Page fullWidth>
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
              { selected == 0 ? 
                  (<Dashboard/>)
                :
                  (<Guide/>)
              }
            </Tabs>
          </Page>
        </MyProvider>
      </AppBridgeProvider>
    </PolarisProvider>
  );
}

function MyProvider({ children }) {
  const app = useAppBridge();

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      credentials: "include",
      fetch: userLoggedInFetch(app),
    }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}
