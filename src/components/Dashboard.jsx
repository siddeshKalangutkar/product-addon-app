import React, { useCallback, useState, useEffect } from 'react';
import { Card, Page, Layout, TextContainer, Image, Stack, Link, Banner, Heading, Modal, Button, EmptyState } from "@shopify/polaris";
import { RuleForm } from './RuleForm';
import { RuleList } from "./RuleList";
import { userLoggedInFetch } from "../App";
import { Loading, Toast, useAppBridge } from "@shopify/app-bridge-react";
import { gql, useMutation, useQuery, useLazyQuery } from "@apollo/client";

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const ADD_METAFIELD = gql`
  mutation addProductMetafields($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        metafields(first: 5) {
          edges {
            node {
              id
              namespace
              key
              value
            }
          }
        }
      }
    }
  }
`;

const METAFIELD_ID = gql`
  query ProductMetafield($namespace: String!, $ownerId: ID!, $key: String!) {
    product(id: $ownerId) {
      metafield(key: $key namespace: $namespace) {
            id
            key
            value
      }
    }
  }
`;

const DELETE_METAFIELD = gql`
  mutation metafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;


export function Dashboard() {
    const app = useAppBridge();
    const fetch = userLoggedInFetch(app);

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const [deleteActive, setDeleteActive] = useState(false);
    const toggledeleteActive = useCallback(() => setDeleteActive((active) => !active), []);

    const [readonly, setReadonly] = useState(false)

    const [ruleData, setRuleData] = useState([]);

    const saveData = async () => {

        console.log("deleted products", deletedProducts)

        let promise = new Promise((resolve) => resolve());

        if (deletedProducts.length > 0) {
            for (const product of deletedProducts) {
                // console.log("product", product)

                let metafield_id_response = await get_metafield_id({
                    variables: {
                        "namespace": "app_meta",
                        "ownerId": product.id,
                        "key": product.key
                    }
                })
                console.log("metafield_id ", metafield_id_response)
                let metafield_id = metafield_id_response.data.product.metafield ? metafield_id_response.data.product.metafield.id : null;

                const metaInput = {
                    id: metafield_id
                };
                console.log("metaInput", metaInput)
                promise = promise.then(() =>
                    deleteMetafield({
                        variables: { input: metaInput },
                    })
                );
            }
            if (promise) {
                promise.then(() => {
                    setDeletedProducts([])
                    console.log("metafields added");
                });
            }
        }

        for (const product of formData.products.selection) {
            // console.log("product", product)

            let metafield_id_response = await get_metafield_id({
                variables: {
                    "namespace": "app_meta",
                    "ownerId": product.id,
                    "key": formData.name
                }
            })
            console.log("metafield_id ", metafield_id_response)
            let metafield_id = metafield_id_response.data.product.metafield ? metafield_id_response.data.product.metafield.id : null;

            const productInput = {
                id: product.id,
                metafields: [
                    {
                        namespace: "app_meta",
                        key: formData.name,
                        type: "single_line_text_field",
                        value: formData.addon_type[0] + " | " + formData.addons.selection.map(pdt => pdt.handle).join(";")
                    }
                ]
            };
            metafield_id ? productInput.metafields[0].id = metafield_id : "";
            console.log("productInput", productInput)
            promise = promise.then(() =>
                mutateMetafield({
                    variables: { input: productInput },
                })
            );
        }
        if (promise) {
            promise.then(() => (console.log("metafields added")));
        }

        toggleActive()
        // console.log('save data called', formData)
        let shop_response = await fetch("/get-shop")
        let shop = await shop_response.json();
        // console.log("shop", shop)
        let data = formData
        data["shop"] = shop.shop
        delete data._id
        console.log("data", data)

        fetch("/update-rule", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(res => res.json())
            .then(json => {
                console.log(json)
                renderRules()
            })
            .catch(error => console.log(error))
    }

    const renderRules = async () => {
        let shop_response = await fetch("/get-shop")
        let shop = await shop_response.json();
        let db_rules_response = await fetch("/get-rules", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(shop) })
        let db_rules = await db_rules_response.json()
        console.log("db_rules", db_rules)
        setRuleData(db_rules.data)
    }

    const openModal = async (data, editable) => {
        toggleActive()
        updateFormData(data)
        setReadonly(editable)
    }

    useEffect(() => {
        renderRules()
    }, [])

    const [deletedProducts, setDeletedProducts] = useState([]);

    const [formData, updateFormData] = useState({});
    const updateFormField = (e) => {
        updateFormData(formData => ({
            ...formData,
            // Trimming any whitespace
            [e.name]: e.value
        }));
        console.log("Updated form data", formData)
    };

    const [deleteData, setDeleteData] = useState({});
    const deleteFormData = async () => {
        // console.log(deleteData)
        let promise = new Promise((resolve) => resolve());
        for (const product of deleteData.products.selection) {
            // console.log("product", product)

            let metafield_id_response = await get_metafield_id({
                variables: {
                    "namespace": "app_meta",
                    "ownerId": product.id,
                    "key": deleteData.name
                }
            })
            console.log("metafield_id ", metafield_id_response)
            let metafield_id = metafield_id_response.data.product.metafield ? metafield_id_response.data.product.metafield.id : null;

            const metaInput = {
                id: metafield_id
            };

            console.log("productInput", metaInput)
            promise = promise.then(() =>
                deleteMetafield({
                    variables: { input: metaInput },
                })
            );
        }
        if (promise) {
            promise.then(() => (console.log("metafields deleted")));
        }
        toggledeleteActive()
        let shop_response = await fetch("/get-shop")
        let { shop } = await shop_response.json();
        let data = { shop: shop, name: deleteData.name }
        console.log("data", data)
        fetch("/delete-rule", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(res => res.json())
            .then(json => {
                console.log(json)
                renderRules()
            })
            .catch(error => console.log(error))
    }
    const openDeleteModal = async (data) => {
        toggledeleteActive()
        setDeleteData(data)
    }

    const [get_metafield_id, metafield_id_res] = useLazyQuery(METAFIELD_ID);
    const [deleteMetafield, deleteMetaRes] = useMutation(DELETE_METAFIELD);
    const [mutateMetafield, { data, loading, error }] = useMutation(ADD_METAFIELD);
    if (loading) return <Loading />;
    if (error) {
        console.warn(error);
        return <Banner status="critical">{error.message}</Banner>;
    }

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
                                <Button onClick={() => { openModal({}, false) }}>Add Rule</Button>
                            </Stack.Item>
                        </Stack>
                    </Card>
                    <Card sectioned>
                        {
                            ruleData.length > 0 ?
                                (
                                    <>
                                        <TextContainer>
                                            <Heading>Rules</Heading>
                                            <RuleList data={ruleData} openModal={openModal} openDeleteModal={openDeleteModal} />
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
                                <RuleForm formData={formData} updateFormData={updateFormField} readonly={readonly} setDeletedProducts={setDeletedProducts} />
                            </Stack>
                        </Modal.Section>
                    </Modal>

                    <Modal
                        small
                        open={deleteActive}
                        onClose={toggledeleteActive}
                        title="Delete Rule"
                        primaryAction={{
                            content: 'Delete',
                            destructive: true,
                            onAction: deleteFormData
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: toggledeleteActive,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <Stack vertical>
                                <p>Delete the <b>{deleteData.name}</b> rule?</p>
                            </Stack>
                        </Modal.Section>
                    </Modal>

                </Layout.Section>
            </Layout>
        </Page>
    );
}
