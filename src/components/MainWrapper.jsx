import React, { useCallback, useState, useEffect } from 'react';
import { userLoggedInFetch } from "../App";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Tabs, FooterHelp, Link } from "@shopify/polaris";
import { Dashboard } from "./Dashboard";
import { Guide } from "./Guide"
import { PricePlan } from './PricePlan';


export function MainWrapper() {
    const app = useAppBridge();
    const fetch = userLoggedInFetch(app);

    const [pricePlan, setPricePlan] = useState(true);
    const [activePlan, setActivePlan] = useState(false);

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
        !(account_info.subscriptionPlanId && account_info.status == "active") ? setPricePlan(false) : setPricePlan(true)
        typeof account_info.status != "undefined" ? setActivePlan(true): "" ;
    }
    useEffect(() => {
        getAccount()
    }, [])

    return (
        <>
            {
                pricePlan ?
                    (
                        <>
                        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                            {selected == 0 ?
                                (<Dashboard />)
                                :
                                (<Guide />)
                            }
                        </Tabs>
                        <FooterHelp>
                            For any app related query contact us at{' '}
                            <Link url="mailto:xyz@support.com" external>
                                xyz@support.com
                            </Link>
                        </FooterHelp>
                        </>
                    )
                    :
                    (
                        <PricePlan activePlan={activePlan} />
                    )
            }

        </>
    )

}