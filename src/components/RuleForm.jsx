import React, { useState, useCallback, useEffect } from "react";
import { FormLayout, TextField, ChoiceList, Button, Stack, Tag, InlineError } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";

// import { AddonList } from "./AddonList";
// import { AddonInput } from "./AddonInput";

export function RuleForm({ formData, updateFormData, readonly, setDeletedProducts, ruleNames }) {
    const [value, setValue] = useState(formData.name ? formData.name : "");
    const handleChange = useCallback((newValue) => {
        setValue(newValue), []
        updateFormData({ name: "name", value: newValue })
    });

    const [selectedChoice, setSelectedChoice] = useState(formData.addon_type && formData.addon_type.length > 0 ? [formData.addon_type[0]] : ['none']);
    const handleChoiceListChange = useCallback((value) => {
        // console.log("value chocice change", value)
        setSelectedChoice(value)
        updateFormData({ name: "addon_type", value: value })
        setSelectedTags([])
    }, []);
    const renderChildren = useCallback((isSelected) =>
        isSelected && (
            <Button onClick={activateResourcePicker} >Add {selectedChoice}</Button>
        ), [selectedChoice]
    );

    const [openResourcepicker, setOpenResourcepicker] = useState(false);
    const [resourcepickerValue, setResourcepickerValue] = useState((typeof formData.addons != 'undefined') && formData.addons.selection.length > 0 ? formData.addons : {});
    const handleResourcePickerSelection = useCallback((value) => {
        setOpenResourcepicker(false)
        setResourcepickerValue(value)
        setSelectedTags(value.selection.map(product => product.title))
        updateFormData({ name: "addons", value: value })
    }, [resourcepickerValue]);

    const [selectedTags, setSelectedTags] = useState((typeof formData.addons != 'undefined' ? formData.addons.selection.map(item => item.handle) : []));
    const removeTag = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
            handleResourcePickerSelection({ selection: formData.addons.selection.filter((item) => item.handle != tag) })
        },
        [],
    );
    const tagMarkup = selectedTags.map((option) => (
        <Tag key={option} onRemove={removeTag(option)}>
            {option}
        </Tag>
    ));

    const [selectProducts, setSelectProducts] = useState((typeof formData.products != 'undefined') ? formData.products.selection.map(item => item.handle) : []);
    const removeSelectedProducts = useCallback(
        (tag) => () => {
            setSelectProducts((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
            handleProductPicker({ selection: formData.products.selection.filter((item) => item.handle != tag) })
            if (readonly) {
                setDeletedProducts(prevState => [...prevState, { id: formData.products.selection.filter((item) => item.handle == tag).map(item => item.id).join(''), key: formData.name }])
            }
        },
        [],
    );
    const selectProductsTag = selectProducts.map((option, index) => (
        <Tag key={index} onRemove={removeSelectedProducts(option)}>
            {option}
        </Tag>
    ));
    const [openProductPicker, setOpenProductPicker] = useState(false);
    const [productpickerValue, setproductpickerValue] = useState((typeof formData.products != 'undefined') && formData.products.selection.length > 0 ? formData.products : {});
    const handleProductPicker = useCallback((value) => {
        setOpenProductPicker(false)
        if (readonly) {
            // console.log("productPickerValue", productpickerValue)
            let diffArray = productpickerValue.selection.filter(item => !value.selection.includes(item)).map(item => {return { id : item.id , key: formData.name}})
            // console.log("diffArray", diffArray)
            setDeletedProducts(prevState => [...prevState, ...diffArray])
        }
        setproductpickerValue(value)
        // console.log("Productpicker", value)
        setSelectProducts(value.selection.map(product => product.title))
        updateFormData({ name: "products", value: value })
    }, [productpickerValue]);

    const [activeProductPicker, setActiveProductPicker] = useState(true);
    const activateProductPicker = async () => {
        setActiveProductPicker(true)
        setOpenProductPicker(true)
    }
    const activateResourcePicker = () => {
        setActiveProductPicker(false)
        setOpenResourcepicker(true)
    }

    return (
        <FormLayout>
            <FormLayout>
                <TextField label="Rule title" id="ruleName" value={value} onChange={handleChange} readOnly={readonly} />
                {(!readonly) && formData.name && ruleNames.includes(formData.name) ? (<InlineError message="Rule name must be unique" fieldID="ruleName" />) : "" }
                <p>Select products for which the rule is to be applied:</p>
                <Button onClick={activateProductPicker} >Select Products</Button>
                <Stack spacing="tight">{selectProductsTag}</Stack>
                {/* <ResourcePicker
                    resourceType="Product"
                    showVariants={true}
                    open={openProductPicker}
                    onSelection={(resources) => handleProductPicker(resources)}
                    onCancel={() => setOpenProductPicker(false)}
                    key="productPicker"
                /> */}

                {/* <AddonInput/>
                <AddonList/> */}

                {/* {selectProducts.length > 0 ? (<Stack spacing="tight">{selectProductsTag}</Stack>) : (<Button onClick={setOpenProductPicker} >Select Products</Button>)} */}

                <ChoiceList
                    title="Select addons for the rule:"
                    choices={[
                        { label: 'product', value: 'product', renderChildren },
                        { label: 'collection', value: 'collection', renderChildren },
                    ]}
                    selected={selectedChoice}
                    onChange={handleChoiceListChange}
                />
                <Stack spacing="tight">{tagMarkup}</Stack>
                {
                    !activeProductPicker ?
                        selectedChoice == "collection" ?
                            (<ResourcePicker
                                resourceType="Collection"
                                selectMultiple={false}
                                open={openResourcepicker}
                                // initialSelectionIds = {(typeof resourcepickerValue.selection != 'undefined') && resourcepickerValue.selection.length > 0 ? resourcepickerValue.selection.map(item => { return { id : item.id} }) : []}
                                onSelection={(resources) => handleResourcePickerSelection(resources)}
                                onCancel={() => setOpenResourcepicker(false)}
                                key="addonCollectionPicker"
                            />
                            ) :
                            (<ResourcePicker
                                resourceType="Product"
                                showVariants={false}
                                open={openResourcepicker}
                                showDraft = {false}
                                initialSelectionIds = {(typeof resourcepickerValue.selection != 'undefined') && resourcepickerValue.selection.length > 0 ? resourcepickerValue.selection.map(item => { return { id : item.id} }) : []}
                                onSelection={(resources) => handleResourcePickerSelection(resources)}
                                onCancel={() => setOpenResourcepicker(false)}
                                key="addonProductPicker"
                            />
                            ) :
                        (<ResourcePicker
                            resourceType="Product"
                            showVariants={true}
                            open={openProductPicker}
                            showDraft = {false}
                            initialSelectionIds = {(typeof productpickerValue.selection != 'undefined') && productpickerValue.selection.length > 0 ? productpickerValue.selection.map(item => { return { id : item.id} }) : []}
                            onSelection={(resources) => handleProductPicker(resources)}
                            onCancel={() => setOpenProductPicker(false)}
                            key="productPicker"
                        />)
                }
            </FormLayout>
        </FormLayout>
    );
}
