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
