import React from "react";

import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.css";


function Home() {
    const context = useDocusaurusContext();
    const { siteConfig = {} } = context;

    return (
    <Layout>
        <main className={styles.heroBanner} style={{ height: 'calc(100vh - 60px)' }}>
            <div style={{display: "block" }} >
                <p>Ciao, my name is</p>
                <h1>PC WONG.</h1>
                <p>I would like to share some of my best moments in life here.</p>
            </div>
        </main>
    </Layout>
    );
}

export default Home;
