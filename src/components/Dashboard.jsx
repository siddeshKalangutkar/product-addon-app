import React, { useCallback, useState, useEffect } from 'react';
import { Card, Page, Layout, TextContainer, Image, Stack, Icon, Banner, Heading, Modal, Button, EmptyState, Spinner, TextStyle } from "@shopify/polaris";
import { RuleForm } from './RuleForm';
import { RuleList } from "./RuleList";
import { userLoggedInFetch } from "../App";
import { Loading, Toast, useAppBridge } from "@shopify/app-bridge-react";
import { gql, useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { CircleAlertMajor } from '@shopify/polaris-icons';

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

    const [deleteAllActive, setdeleteAllActive] = useState(false);
    const toggledeleteAllActive = useCallback(() => setdeleteAllActive((active) => !active), []);

    const [readonly, setReadonly] = useState(false)
    const [loader, setLoader] = useState(false)
    const [modalLoader, setModalLoader] = useState(false)

    const [activeToast, setActiveToast] = useState(false)
    const toggleToast = useCallback(
        () => setActiveToast((activeToast) => !activeToast),
        [],
    );
    const toastMarkup = activeToast ? (
        <Toast content="Changes Saved" onDismiss={toggleToast} />
    ) : null;

    const [ruleData, setRuleData] = useState([]);
    const [ruleNames, setRuleNames] = useState([]);

    const saveData = async () => {
        setModalLoader(true)
        let promise = new Promise((resolve) => resolve());

        if (deletedProducts.length > 0) {
            for (const product of deletedProducts) {
                let metafield_id_response = await get_metafield_id({
                    variables: {
                        "namespace": "app_meta",
                        "ownerId": product.id,
                        "key": product.key
                    }
                })
                let metafield_id = metafield_id_response.data.product.metafield ? metafield_id_response.data.product.metafield.id : null;

                const metaInput = {
                    id: metafield_id
                };
                promise = promise.then(() =>
                    deleteMetafield({
                        variables: { input: metaInput },
                    })
                );
            }
            if (promise) {
                promise.then(() => {
                    setDeletedProducts([])
                });
            }
        }

        for (const product of formData.products.selection) {
            let metafield_id_response = await get_metafield_id({
                variables: {
                    "namespace": "app_meta",
                    "ownerId": product.id,
                    "key": formData.name
                }
            })
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
        setModalLoader(false)
        toggleToast()
        let shop_response = await fetch("/get-shop")
        let shop = await shop_response.json();
        let data = formData
        data["shop"] = shop.shop
        delete data._id

        fetch("/update-rule", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(res => res.json())
            .then(json => {
                renderRules()
            })
            .catch(error => console.log(error))
    }

    const renderRules = async () => {
        setLoader(true)
        let shop_response = await fetch("/get-shop")
        let shop = await shop_response.json();
        let db_rules_response = await fetch("/get-rules", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(shop) })
        let db_rules = await db_rules_response.json()
        setRuleData(db_rules.data)
        db_rules.data.length > 0 ? setRuleNames(db_rules.data.map( rule => rule.name)) : "";
        setLoader(false)
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
    };

    const [deleteData, setDeleteData] = useState({});
    const deleteFormData = async () => {
        setModalLoader(true)
        let promise = new Promise((resolve) => resolve());
        for (const product of deleteData.products.selection) {
            let metafield_id_response = await get_metafield_id({
                variables: {
                    "namespace": "app_meta",
                    "ownerId": product.id,
                    "key": deleteData.name
                }
            })
            let metafield_id = metafield_id_response.data.product.metafield ? metafield_id_response.data.product.metafield.id : null;

            const metaInput = {
                id: metafield_id
            };

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
        setModalLoader(false)
        toggleToast()
        let shop_response = await fetch("/get-shop")
        let { shop } = await shop_response.json();
        let data = { shop: shop, name: deleteData.name }
        fetch("/delete-rule", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(res => res.json())
            .then(json => {
                renderRules()
            })
            .catch(error => console.log(error))
    }
    const openDeleteModal = async (data) => {
        toggledeleteActive()
        setDeleteData(data)
    }

    const deleteAllRules = async () => {
        setModalLoader(true)
        try {
            await fetch("/delete-all-rules", { method: "POST", headers: { 'Content-Type': 'application/json' } })
            await renderRules()
        }
        catch (error) {
            console.log("error deleting all data", error)
        }
        finally {
            setModalLoader(false)
            toggledeleteAllActive()
            toggleToast()
        }
    }

    const [get_metafield_id, metafield_id_res] = useLazyQuery(METAFIELD_ID);
    const [deleteMetafield, deleteMetaRes] = useMutation(DELETE_METAFIELD);
    const [mutateMetafield, { data, loading, error }] = useMutation(ADD_METAFIELD);
    // if (loading) return <Loading />;
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
                            <Stack.Item>
                                <Button onClick={toggledeleteAllActive} destructive>Delete All Rules</Button>
                            </Stack.Item>
                        </Stack>
                    </Card>
                    <Card sectioned>
                        {
                            // ruleData.length > 0 ?
                            (
                                <>
                                    <TextContainer>
                                        <Heading>Rules</Heading>
                                        <RuleList data={ruleData} openModal={openModal} openDeleteModal={openDeleteModal} setLoader={setLoader} loader={loader} />
                                    </TextContainer>
                                </>
                            )
                            // :
                            // (
                            //     <EmptyState
                            //         heading="No rules created yet"
                            //         action={{
                            //             content: "Add Rule",
                            //             onAction: toggleActive,
                            //         }}
                            //         image={img}
                            //         imageContained
                            //     >
                            //     </EmptyState>
                            // )
                        }
                    </Card>
                    {
                        ruleData.length > 0 ?
                            (
                                <div style={{ marginTop: '1rem' }}>
                                    <Stack vertical={false} alignment="center" distribution="center" sectioned>
                                        <Stack.Item wrap={false} vertical={false}>
                                            <Icon source={CircleAlertMajor} color="warning" />
                                        </Stack.Item>
                                        <Stack.Item>
                                            <TextStyle variation="warning" >Delete all the created rules before uninstalling the app.</TextStyle>
                                        </Stack.Item>
                                    </Stack>
                                </div>
                            ) : ""
                    }

                    <Modal
                        large
                        open={active}
                        onClose={toggleActive}
                        title="Rule"
                        loading={modalLoader}
                        primaryAction={{
                            content: 'Save',
                            onAction: saveData,
                            disabled: (!readonly) && formData.name && ruleNames.includes(formData.name) ? true : false
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
                                <RuleForm formData={formData} updateFormData={updateFormField} readonly={readonly} setDeletedProducts={setDeletedProducts} ruleNames={ruleNames} />
                            </Stack>
                        </Modal.Section>
                    </Modal>

                    <Modal
                        small
                        open={deleteActive}
                        onClose={toggledeleteActive}
                        title="Delete Rule"
                        loading={modalLoader}
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
                    <Modal
                        small
                        open={deleteAllActive}
                        onClose={toggledeleteAllActive}
                        title="Delete Rule"
                        loading={modalLoader}
                        primaryAction={{
                            content: 'Delete',
                            destructive: true,
                            onAction: deleteAllRules
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: toggledeleteAllActive,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <Stack vertical>
                                <p>Delete all the created rules?</p>
                            </Stack>
                        </Modal.Section>
                    </Modal>
                    {toastMarkup}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
