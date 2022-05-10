import React, { useEffect, useState } from 'react';
import { Button, Card, ResourceItem, ResourceList, Stack, TextStyle } from '@shopify/polaris';

export function AddonList() {
    const [addonData, setAddonData] = useState({})
    const [addonArray, setAddonArray] = useState([])

    useEffect(() => {
        for (var key in addonData) {
            setAddonArray( addonArray => [...addonArray, {title: key, price: addonData[key]} ] )
        }
        console.log(addonArray)
    }, [addonData])

    return (
        <Card>
            <ResourceList
                resourceName={{ singular: 'Addon', plural: 'Addons' }}
                items={addonArray}
                renderItem={(item, index) => {
                    return (
                        <ResourceItem
                            id={index}
                        >
                            <Stack distribution="equalSpacing">
                                <h3>
                                    <TextStyle variation="strong">{item.title}</TextStyle>
                                </h3>
                                <div>Rs. {item.price}</div>
                                <Button plain destructive>Remove</Button>
                            </Stack>
                        </ResourceItem>
                    );
                }}
            />
        </Card>
    )
}