import Head from "next/head";
import { Header } from "../../components/Header";
import { Box, chakra, Container, Text } from "@chakra-ui/react";
import { Footer } from "../../components/Footer";
import React from "react";

const SubscriptionPage = () => {
    return (
        <>
            <Head>
                <title>サブスクリプションの管理 - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Header />
            <Box mb={20}>
                <Box as="section" pt={{ base: "10rem", md: "12rem" }} pb={{ base: "0", md: "1rem" }}>
                    <Box textAlign="center">
                        <chakra.h1
                            maxW="16ch"
                            mx="auto"
                            fontSize={{ base: "2.25rem", sm: "2rem", lg: "3rem" }}
                            fontFamily="heading"
                            letterSpacing="tighter"
                            fontWeight="extrabold"
                            marginBottom="16px"
                            lineHeight="1.2"
                        >
                            サブスクリプションの管理ページ
                        </chakra.h1>
                        <Text maxW="560px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                            定期的に寄付をしている対象の記録を管理します。
                            <br />
                            サブスクリプションに登録している対象は、指定したタイミングで自動的に記録が追加できます。
                        </Text>
                    </Box>

                    <Container maxW="xl">
                        <Box w="100%" p={4}>
                            TEST
                        </Box>
                    </Container>
                </Box>
                <Footer />
            </Box>
        </>
    );
};
export default SubscriptionPage;
