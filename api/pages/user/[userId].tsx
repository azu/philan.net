import {
    Box,
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
    Text
} from "@chakra-ui/react";
import { CheckCircleIcon, ChevronUpIcon } from "@chakra-ui/icons";
import dayjs from "dayjs";
import React from "react";
import type { GetResponseBody } from "../api/spreadsheet/api-types";
import { getSpreadSheet } from "../api/spreadsheet/get";
import { createUserKvs } from "../../api-utils/userKvs";
import Head from "next/head";

function UserPage({ response, userName }: { userName: string; userId: string; response: GetResponseBody }) {
    return (
        <>
            <Head>
                <title>{userName} - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Container maxW="xl">
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
                                        <StatNumber>{item.stats.budge.value}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>使用金額</StatLabel>
                                        <StatNumber>{item.stats.used.value}</StatNumber>
                                        <StatHelpText>{item.stats.used.raw / item.stats.budge.raw}%</StatHelpText>
                                    </Stat>

                                    <Stat>
                                        <StatLabel>残高</StatLabel>
                                        <StatNumber>{item.stats.balance.value}</StatNumber>
                                        <StatHelpText>{100 - item.stats.used.raw / item.stats.budge.raw}%</StatHelpText>
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
                                                    <Text color="gray.600">{item.memo}</Text>
                                                </ListItem>
                                            );
                                        })}
                                </List>
                            </div>
                        );
                    })}
                </Box>
            </Container>
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
    return {
        props: {
            userName: user.name,
            userId: user.id,
            response: res
        },
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 120 // In seconds
    };
}

export default UserPage;
