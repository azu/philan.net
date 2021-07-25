import "./_app.styles.css";
import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { UserProvider } from "../components/useLoginUser";

export const theme = extendTheme({
    components: {
        Link: {
            variants: {
                primary: ({ colorScheme = "teal" }) => ({
                    color: `${colorScheme}.500`,
                    _hover: {
                        color: `${colorScheme}.400`
                    }
                })
            },
            defaultProps: {
                variant: "teal"
            }
        }
    }
});
export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider theme={theme}>
            <UserProvider>
                <Component {...pageProps} />
            </UserProvider>
        </ChakraProvider>
    );
}
