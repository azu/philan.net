import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

interface Props {
    locale: "en-US" | "ja-JP";
}

class CustomDocument extends Document<Props> {
    render() {
        return (
            <Html lang={"ja-JP"}>
                <Head>
                    <meta name="description" content="Philan.netは、自身の寄付内容を公開、管理できるサービスです。" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png" />
                    {/* No cookie Analytics https://www.cloudflare.com/web-analytics/ */}
                    {process.env.NODE_ENV === "production" ? (
                        <script
                            defer
                            src="https://static.cloudflareinsights.com/beacon.min.js"
                            data-cf-beacon='{"token": "9768e4dc331b4d598f08d0e0bb243535", "spa": true}'
                        ></script>
                    ) : null}
                </Head>
                <body>
                    <Main />

                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default CustomDocument;
