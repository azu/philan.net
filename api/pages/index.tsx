import { getUserList } from "./api/user/list";
import Head from "next/head";
import {
    Box,
    chakra,
    Container,
    Flex,
    Link,
    Text,
    List,
    ListIcon,
    ListItem,
    useColorModeValue,
    Stack,
    Button
} from "@chakra-ui/react";
import React from "react";
import { ArrowForwardIcon, ArrowRightIcon } from "@chakra-ui/icons";

import NextLink from "next/link";

const IndexPage = (props: { users: string[] }) => {
    return (
        <>
            <Head>
                <title>philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Container maxW="2xl">
                <Box marginBottom={20}>
                    <Box as="section" pt={{ base: "10rem", md: "12rem" }} pb={{ base: "0", md: "5rem" }}>
                        <Container>
                            <Box textAlign="center">
                                <chakra.h1
                                    maxW="16ch"
                                    mx="auto"
                                    fontSize={{ base: "2.25rem", sm: "3rem", lg: "4rem" }}
                                    fontFamily="heading"
                                    letterSpacing="tighter"
                                    fontWeight="extrabold"
                                    marginBottom="16px"
                                    lineHeight="1.2"
                                >
                                    Philan.net
                                    <Box as="span" color={useColorModeValue("teal.500", "teal.300")}>
                                        {" "}
                                        with you
                                    </Box>
                                </chakra.h1>

                                <Text maxW="560px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                                    Philan.netは、自身の寄付内容を公開、管理できるサービスです。
                                    寄付する額を事前に決めておくことで、寄付する気持ちを楽にします。
                                </Text>

                                <Stack mt="10" spacing="4" justify="center" direction={{ base: "column", sm: "row" }}>
                                    <NextLink href="/api/auth" passHref>
                                        <Button
                                            h="4rem"
                                            px="40px"
                                            fontSize="1.2rem"
                                            as="a"
                                            size="lg"
                                            colorScheme="teal"
                                            rightIcon={<ArrowRightIcon />}
                                        >
                                            Login with Google
                                        </Button>
                                    </NextLink>
                                    <Button
                                        as="a"
                                        size="lg"
                                        h="4rem"
                                        px="40px"
                                        fontSize="1.2rem"
                                        href="https://github.com/chakra-ui/chakra-ui/"
                                    >
                                        How to Use?
                                    </Button>
                                </Stack>
                            </Box>
                        </Container>
                    </Box>
                </Box>
                <Box padding={"2"}>
                    <Container>
                        <Box textAlign="center">
                            <chakra.h1
                                maxW="16ch"
                                mx="auto"
                                fontSize={{ base: "2.25rem", sm: "3rem", lg: "4rem" }}
                                fontFamily="heading"
                                letterSpacing="tighter"
                                fontWeight="extrabold"
                                mb="16px"
                                lineHeight="1.2"
                            >
                                <Box as="span" color={useColorModeValue("pink.500", "pink.300")}>
                                    Philanthropist
                                </Box>
                            </chakra.h1>
                            <Box>
                                <Text maxW="560px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                                    Philan.netで慈善活動を公開している人たちです。
                                </Text>
                            </Box>
                            <List fontSize={{ base: "1.25rem", sm: "1rem", lg: "2rem" }}>
                                {props.users.map((user) => {
                                    return (
                                        <ListItem key={user}>
                                            <Flex alignItems={"baseline"}>
                                                <Box padding="2">
                                                    <ListIcon as={ArrowForwardIcon} color="green.500" />
                                                    <Link
                                                        href={`/user/${user}`}
                                                        borderBottom={"1px"}
                                                        borderColor={"blue.200"}
                                                    >
                                                        {user}
                                                    </Link>
                                                </Box>
                                            </Flex>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </Container>
                </Box>
            </Container>
        </>
    );
};

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getServerSideProps() {
    const users = await getUserList();
    return {
        props: {
            users
        }
    };
}

export default IndexPage;
