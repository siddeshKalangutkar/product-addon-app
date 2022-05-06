import { ResourcePicker } from '@shopify/app-bridge-react';
import { useState } from 'react';
import { Button } from "@shopify/polaris";

export function ProductPicker() {
    const [isOpen, setIsOpen] = useState(false);
    const [productSelection , setProductSelection] = useState([])

    return (
        <>
            <Button
                primary
                onClick={() => setIsOpen(true)}
            >
                Select Products
            </Button>
            <ResourcePicker
                resourceType="Product"
                open={isOpen}
                initialSelectionIds={productSelection}
                onSelection={SelectPayload => {
                    // console.log(SelectPayload)
                    setProductSelection([])
                    SelectPayload.selection.map((prod)=> setProductSelection(productSelection => [...productSelection, {id: prod.id}]))
                    setIsOpen(false)
                }}
                onCancel={()=>setIsOpen(false)}
            />
        </>
    )
}