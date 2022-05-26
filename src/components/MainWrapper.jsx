import React, { useCallback, useState, useEffect } from 'react';
import { userLoggedInFetch } from "../App";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Tabs } from "@shopify/polaris";
import { Dashboard } from "./Dashboard";
import { Guide } from "./Guide"
import { PricePlan } from './PricePlan';


export function MainWrapper() {
    const app = useAppBridge();
    const fetch = userLoggedInFetch(app);

    const [pricePlan, setPricePlan] = useState(true);

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

    const getAccount = async () => {
        let account_info_response = await fetch("/get-account")
        let account_info = await account_info_response.json()
        console.log("account info", account_info)
        !(account_info.subscriptionPlanId) ? setPricePlan(false) : setPricePlan(true)
    }
    useEffect(() => {
        getAccount()
    }, [])

    return (
        <>
            {
                pricePlan ?
                    (
                        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                            {selected == 0 ?
                                (<Dashboard />)
                                :
                                (<Guide />)
                            }
                        </Tabs>
                    )
                    :
                    (
                        <PricePlan/>
                    )
            }

        </>
    )

}