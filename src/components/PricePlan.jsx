import React from 'react';
import { Card, Page, Layout, TextContainer, List, TextStyle, Stack, Link, Banner, Heading, Modal, Button, EmptyState, Spinner } from "@shopify/polaris";
import { userLoggedInFetch } from "../App";
import { useAppBridge } from "@shopify/app-bridge-react";

export function PricePlan({ activePlan }) {
    const app = useAppBridge();
    const fetch = userLoggedInFetch(app);
    const createPlan = async () => {
        let url = activePlan ? "/create-charge" : "create-trial-charge"
        let response = await fetch(url)
        let response_data = await response.json()
        if (response_data.success) {
            // window.open(response_data.data)
            window.top.location.href = response_data.data
        }
    }

    return (
        <Page narrowWidth>
            <Layout>
                <Layout.Section>
                    <Card title=""
                        sectioned primaryFooterAction={{
                            content: 'Select Plan',
                            onAction: createPlan,

                        }}
                        footerActionAlignment="left"
                    >
                        <TextContainer>
                            <Heading>Starter Plan</Heading>
                            <List >
                                <List.Item>
                                    Add product addons
                                </List.Item>
                                <List.Item>
                                    Theme compatible
                                </List.Item>
                                <List.Item>
                                    Quick customer support
                                </List.Item>
                                {!activePlan ?
                                    (
                                        <List.Item>
                                            Get 5 days free trial
                                        </List.Item>
                                    )
                                    :
                                    ""
                                }
                                <List.Item>
                                    <TextStyle variation="strong" >$10/mo</TextStyle>
                                </List.Item>
                            </List>
                        </TextContainer>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}