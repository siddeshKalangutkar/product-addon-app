import React, { useEffect, useState, useCallback } from 'react';
import { FormLayout, TextField, Button, Stack } from '@shopify/polaris';

export function AddonInput() {
    const [titleInput, setTitleInput] = useState('');
    const [priceInput, setPriceInput] = useState(0);
    const handleTitleChange = useCallback((newValue) => setTitleInput(newValue), []);
    const handlePriceChange = useCallback((newValue) => setPriceInput(newValue), []);


    return (
        <FormLayout>
            <FormLayout.Group>
                <TextField
                    label="Addon Title"
                    value={titleInput}
                    onChange={handleTitleChange}
                    autoComplete="off"
                />
                <TextField
                    type="number"
                    label="Addon Price"
                    value={priceInput}
                    onChange={handlePriceChange}
                    autoComplete="off"
                />
            </FormLayout.Group>
            <Button>+ Addon</Button>
        </FormLayout>
    )
}