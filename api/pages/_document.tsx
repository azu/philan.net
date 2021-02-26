import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

interface Props {
    locale: "en-US" | "ja-JP";
}

class CustomDocument extends Document<Props> {
    render() {
        return (
            <Html lang={"ja-JP"}>
                <Head />
                <body>
                    <Main />

                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default CustomDocument;
