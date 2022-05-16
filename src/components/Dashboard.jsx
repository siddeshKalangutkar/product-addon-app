import React, { useCallback, useState } from 'react';
import {
    Card,
    Page,
    Layout,
    TextContainer,
    Image,
    Stack,
    Link,
    Heading,
    Modal,
    Button,
    EmptyState
} from "@shopify/polaris";
import { RuleForm } from './RuleForm';
import { RuleList } from "./RuleList";
import { userLoggedInFetch } from "../App";
import { Toast, useAppBridge } from "@shopify/app-bridge-react";

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';


export function Dashboard() {
    const app = useAppBridge();
    const fetch = userLoggedInFetch(app);

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const rule_data = [
        {
            name: "Rule Name 1",
            products: ["989898", "787989"],
            addon_type: "product",
            addons: ["09390", "22334"]
        },
        {
            name: "Rule Name 2",
            products: ["989898", "787989"],
            addon_type: "product",
            addons: ["09390", "22334"]
        }
    ]
    const saveData = async () => {
        toggleActive()
        console.log('save data called', formData)
        let shop_response = await fetch("/get-shop")
        let shop = await shop_response.json();
        console.log("shop", shop)
        let data = formData
        data["shop"] = shop.shop
        console.log("data",data)
        fetch("/update-rule", { method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)})
            .then(res => res.json())
            .then(json => console.log(json))
            .catch(error => console.log(error))
    }
    const [formData, updateFormData] = useState({});
    const updateFormAllData = (value) => {
        updateFormData(value);
    };
    const updateFormField = (e) => {
        updateFormData(formData => ({
            ...formData,
            // Trimming any whitespace
            [e.name]: e.value
        }));
        console.log("Updated form data", formData)
    };

    return (
        <Page fullWidth>
            <Layout>
                <Layout.Section>
                    <Card sectioned>
                        <Stack
                            wrap={false}
                            spacing="extraTight"
                            distribution="trailing"
                            alignment="right"
                        >
                            <Stack.Item fill>
                                <Button onClick={toggleActive}>Add Rule</Button>
                            </Stack.Item>
                        </Stack>
                    </Card>
                    <Card sectioned>
                        {
                            rule_data.length > 0 ?
                                (
                                    <>
                                        <TextContainer>
                                            <Heading>Rules</Heading>
                                            <RuleList data={rule_data} />
                                        </TextContainer>
                                    </>
                                )
                                :
                                (
                                    <EmptyState
                                        heading="No rules created yet"
                                        action={{
                                            content: "Add Rule",
                                            onAction: toggleActive,
                                        }}
                                        image={img}
                                        imageContained
                                    >
                                    </EmptyState>
                                )
                        }
                    </Card>


                    <Modal
                        large
                        open={active}
                        onClose={toggleActive}
                        title="Rule"
                        primaryAction={{
                            content: 'Save',
                            onAction: saveData,
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: toggleActive,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <Stack vertical>
                                <RuleForm formData={formData} updateFormData={updateFormField} />
                            </Stack>
                        </Modal.Section>
                    </Modal>


                </Layout.Section>
            </Layout>
        </Page>
    );
}
