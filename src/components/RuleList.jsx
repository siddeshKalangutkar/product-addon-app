import React from 'react';
import { Card, ResourceItem, ResourceList, TextStyle } from '@shopify/polaris';

export function RuleList({data}) {
    return (
        <Card>
            <ResourceList
                resourceName={{ singular: 'Rule', plural: 'Rules' }}
                items={data}
                renderItem={(item) => {
                    const { name } = item;

                    return (
                        <ResourceItem
                            id={name}
                        >
                            <h3>
                                <TextStyle variation="strong">{name}</TextStyle>
                            </h3>
                        </ResourceItem>
                    );
                }}
            />
        </Card>
    )
}
