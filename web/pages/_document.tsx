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
                    {/* No cookie Analytics https://www.cloudflare.com/web-analytics/ */}
                    <script
                        defer
                        src="https://static.cloudflareinsights.com/beacon.min.js"
                        data-cf-beacon='{"token": "9768e4dc331b4d598f08d0e0bb243535", "spa": true}'
                    ></script>
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
