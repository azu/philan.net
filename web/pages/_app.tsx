import "./_app.styles.css";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { UserProvider } from "../components/useLoginUser";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <UserProvider>
                <Component {...pageProps} />
            </UserProvider>
        </ChakraProvider>
    );
}
