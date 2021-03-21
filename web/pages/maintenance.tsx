import Head from "next/head";
import { Header } from "../components/Header";
import { Box, chakra, Container, Link, Text } from "@chakra-ui/react";
import { Footer } from "../components/Footer";
import React from "react";

function Maintenance() {
    return (
        <>
            <Head>
                <title>Maintenance mode - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Header />
            <Box mb={20}>
                <Box>
                    <Box as="section" pt={{ base: "10rem", md: "12rem" }} pb={{ base: "0", md: "5rem" }}>
                        <Container>
                            <Box textAlign="center">
                                <chakra.h1
                                    fontSize={{ base: "2.25rem", sm: "3rem", lg: "3rem" }}
                                    fontFamily="heading"
                                    letterSpacing="tighter"
                                    fontWeight="bold"
                                    marginBottom="16px"
                                    lineHeight="1.2"
                                >
                                    Briefly unavailable for scheduled maintenance
                                </chakra.h1>
                                <Text mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                                    Please check{" "}
                                    <Link
                                        isExternal={true}
                                        color="teal.500"
                                        href={"https://github.com/azu/philan.net/discussions/categories/maintenance"}
                                    >
                                        Maintenance announcement
                                    </Link>
                                </Text>
                            </Box>
                        </Container>
                    </Box>
                </Box>
                <Footer />
            </Box>
        </>
    );
}

export default Maintenance;
