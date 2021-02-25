import {
    Box,
    chakra,
    Container,
    Flex,
    Heading,
    Link,
    List,
    ListIcon,
    ListItem,
    Spacer,
    Stat,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    Text,
    Icon,
    useColorModeValue
} from "@chakra-ui/react";
import { Header } from "../../components/Header";
import { CheckCircleIcon, ChevronUpIcon } from "@chakra-ui/icons";
import dayjs from "dayjs";
import React from "react";
import type { GetResponseBody } from "../api/spreadsheet/api-types";
import { getSpreadSheet } from "../api/spreadsheet/get";
import { createUserKvs } from "../../api-utils/userKvs";
import Head from "next/head";
import { createMarkdown } from "safe-marked";
import { BiDonateHeart } from "react-icons/bi";

const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan-net.vercel.app";

function UserPage({
    response,
    userId,
    userName,
    README
}: {
    README: string;
    userName: string;
    userId: string;
    response: GetResponseBody;
}) {
    return (
        <>
            <Head>
                <title>{userName} - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta property="og:image" content={`${HOST}/api/ogp/${userId}`} />
            </Head>
            <Header />
            <Box mb={20}>
                <Box as="section" pt={{ base: "10rem", md: "12rem" }} pb={{ base: "0", md: "1rem" }}>
                    <Container>
                        <Box padding={12} border="1px" borderColor="gray.200" borderRadius={8}>
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
                                <Box as="span" color={useColorModeValue("teal.500", "teal.300")}>
                                    <Icon as={BiDonateHeart} />
                                    {userName}
                                </Box>
                            </chakra.h1>
                            <Box maxW="32rem">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: README
                                    }}
                                ></div>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Box mt={{ base: "60px", md: "120px" }} mb="60px">
                <Container>
                    <Box padding={"2"}>
                        {response.map((item) => {
                            return (
                                <div key={item.year}>
                                    <Box maxW="32rem" padding={2}>
                                        <Heading as={"h2"} size={"2xl"}>
                                            {item.year}年
                                        </Heading>
                                    </Box>
                                    <StatGroup padding={2} border="1px" borderColor="gray.200" borderRadius={12}>
                                        <Stat>
                                            <StatLabel>予算</StatLabel>
                                            <StatNumber>{item.stats.budget.value}</StatNumber>
                                        </Stat>
                                        <Stat>
                                            <StatLabel>使用金額</StatLabel>
                                            <StatNumber>{item.stats.used.value}</StatNumber>
                                            <StatHelpText>{item.stats.used.raw / item.stats.budget.raw}%</StatHelpText>
                                        </Stat>

                                        <Stat>
                                            <StatLabel>残高</StatLabel>
                                            <StatNumber>{item.stats.balance.value}</StatNumber>
                                            <StatHelpText>
                                                {100 - item.stats.used.raw / item.stats.budget.raw}%
                                            </StatHelpText>
                                        </Stat>
                                    </StatGroup>
                                    <List>
                                        {item.items
                                            .slice()
                                            .sort((a, b) => {
                                                return dayjs(a.date).isBefore(b.date) ? 1 : -1;
                                            })
                                            .map((item) => {
                                                const safeUrl = /https?:/.test(item.url) ? item.url : "";
                                                return (
                                                    <ListItem key={item.date}>
                                                        <Flex alignItems={"baseline"}>
                                                            <Box padding="2">
                                                                <ListIcon as={CheckCircleIcon} color="green.500" />
                                                                <Link
                                                                    href={safeUrl}
                                                                    borderBottom={"1px"}
                                                                    borderColor={"blue.200"}
                                                                    isExternal={true}
                                                                >
                                                                    {item.to}
                                                                </Link>
                                                                : {item.amount.value}
                                                                <ListIcon as={ChevronUpIcon} color="green.500" />
                                                            </Box>
                                                            <Spacer />
                                                            <Box fontSize={"small"} textAlign={"left"}>
                                                                <time dateTime={item.date}>
                                                                    {dayjs(item.date).format("YYYY-MM-DD")}
                                                                </time>
                                                            </Box>
                                                        </Flex>
                                                        <Text color={useColorModeValue("gray.500", "gray.300")}>
                                                            {item.memo}
                                                        </Text>
                                                    </ListItem>
                                                );
                                            })}
                                    </List>
                                </div>
                            );
                        })}
                    </Box>
                </Container>
            </Box>
        </>
    );
}

export async function getStaticPaths() {
    return { paths: [], fallback: "blocking" };
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps({ params }: { params: { userId: string } }) {
    const userId = params.userId;
    const userKVS = createUserKvs();
    const user = await userKVS.findByUserId(userId);
    if (!user) {
        throw new Error("No user");
    }
    const res = await getSpreadSheet({
        spreadsheetId: user.spreadsheetId,
        credentials: user.credentials
    });
    const markdown = createMarkdown();
    return {
        props: {
            userName: user.name,
            userId: user.id,
            response: res,
            README: markdown(res[0].README)
        },
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 120 // In seconds
    };
}

export default UserPage;