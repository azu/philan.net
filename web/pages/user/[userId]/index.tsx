import {
    Box,
    chakra,
    Container,
    Flex,
    Heading,
    Img,
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
    useColorMode,
    useColorModeValue
} from "@chakra-ui/react";
import { Header } from "../../../components/Header";
import { BellIcon, CheckCircleIcon, ChevronUpIcon } from "@chakra-ui/icons";
import dayjs from "dayjs";
import React, { useCallback } from "react";
import type { GetResponseBody } from "../../api/spreadsheet/api-types";
import { getSpreadSheet } from "../../api/spreadsheet/get";
import { createUserKvs } from "../../../api-utils/userKvs";
import Head from "next/head";
import { createMarkdown } from "safe-marked";
import { Footer } from "../../../components/Footer";
import { MarkdownStyle } from "../../../components/MarkdownStyle";
// const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan.net";
const markdown = createMarkdown();
const Summarize = (props: { children: string }) => {
    const body = markdown(props.children);
    return (
        <Box>
            <Box
                className="UserContent markdown-body"
                opacity={0.8}
                paddingX={"1rem"}
                paddingBottom={"0.5rem"}
                dangerouslySetInnerHTML={{
                    __html: body
                }}
            />
        </Box>
    );
};

function UserPage({
    ok,
    errorMessage,
    response,
    userId,
    userName,
    userAvatarUrl,
    README
}: {
    ok: boolean;
    errorMessage?: string;
    README: string;
    userName: string;
    userAvatarUrl?: string;
    userId: string;
    response: GetResponseBody;
}) {
    if (!ok) {
        return (
            <>
                <Head>
                    <title>SpreadSheet Error - philan.net</title>
                </Head>
                <Header />
                <Box mb={20}>
                    <Box as="section" pt={{ base: "8rem", md: "10rem" }} pb={{ base: "0", md: "1rem" }}>
                        <Container>
                            <Box padding={12} border="1px" borderColor="gray.200" borderRadius={8}>
                                <Text>Can not fetch spreadsheet</Text>
                                <chakra.pre whiteSpace={"normal"}>Error: {errorMessage}</chakra.pre>
                            </Box>
                            <Box>
                                <ul>
                                    <li>Error: unauthorized_client が出ている場合はログインしなおしてください。</li>
                                </ul>
                            </Box>
                            <Box>
                                <Link
                                    href={"https://github.com/azu/philan.net/issues/new"}
                                    isExternal={true}
                                    color="teal.500"
                                >
                                    Issueへ問題を報告してください
                                </Link>
                            </Box>
                        </Container>
                    </Box>
                </Box>
                <Box marginTop={{ base: "60px" }} mb="60px">
                    <Footer />
                </Box>
            </>
        );
    }
    const { colorMode } = useColorMode();
    const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan.net";
    const feedURL = `${HOST}/user/${userId}/feed`;
    const styleGenerator = useCallback(() => MarkdownStyle(colorMode), [colorMode]);
    return (
        <>
            <Head>
                <title>{userName} - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="alternate" type="application/rss+xml" href={feedURL} />
                {/*<meta property="og:image" content={`${HOST}/api/ogp/${userId}`} />*/}
                <style>{styleGenerator()}</style>
            </Head>
            <Header />
            <Box mb={20}>
                <Box as="section" pt={{ base: "8rem", md: "10rem" }} pb={{ base: "0", md: "1rem" }}>
                    <Container>
                        <Box padding={12} border="1px" borderColor="gray.200" borderRadius={8}>
                            <Flex paddingY={4}>
                                <Box>
                                    <Img
                                        width="96px"
                                        height="96px"
                                        boxSize="96px"
                                        borderRadius="full"
                                        objectFit="cover"
                                        alt={userName}
                                        src={userAvatarUrl}
                                    />
                                </Box>
                                <Box paddingX={4}>
                                    <Heading as="h1" size="xl" mt="1em" mb="0.5em">
                                        {userName}
                                    </Heading>
                                </Box>
                            </Flex>
                            <Box maxW="32rem">
                                <div
                                    className={"UserContent"}
                                    dangerouslySetInnerHTML={{
                                        __html: README
                                    }}
                                ></div>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Box marginTop={{ base: "60px" }} mb="60px">
                <Container maxWidth={"80ch"}>
                    <Box padding={"2"}>
                        {response.map((item) => {
                            const balancePercent =
                                item.stats.used.raw < item.stats.budget.raw
                                    ? Math.trunc(
                                          ((item.stats.budget.raw - item.stats.used.raw) / item.stats.budget.raw) * 100
                                      )
                                    : 0;
                            const usedPercent =
                                item.stats.budget.raw !== 0
                                    ? Math.trunc((item.stats.used.raw / item.stats.budget.raw) * 100)
                                    : 0;
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
                                            <StatHelpText>{usedPercent}%</StatHelpText>
                                        </Stat>

                                        <Stat>
                                            <StatLabel>残高</StatLabel>
                                            <StatNumber>{item.stats.balance.value}</StatNumber>
                                            <StatHelpText>{balancePercent}%</StatHelpText>
                                        </Stat>
                                    </StatGroup>
                                    <List paddingY={"1rem"}>
                                        {item.items.map((item) => {
                                            const safeUrl = /https?:/.test(item.url) ? item.url : "";
                                            const Icon =
                                                item.meta.type === "checked" ? (
                                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                                ) : (
                                                    <ListIcon as={BellIcon} color="orange.500" />
                                                );
                                            const Amount =
                                                item.meta.type === "checked" ? (
                                                    <span>
                                                        : {item.amount.value}
                                                        <ListIcon as={ChevronUpIcon} color="green.500" />
                                                    </span>
                                                ) : null;
                                            return (
                                                <ListItem key={item.id} id={item.id}>
                                                    <Flex alignItems={"baseline"}>
                                                        <Box padding="2">
                                                            {Icon}
                                                            <Link
                                                                href={safeUrl}
                                                                borderBottom={"1px"}
                                                                borderColor={"blue.200"}
                                                                isExternal={true}
                                                            >
                                                                {item.to}
                                                            </Link>
                                                            {Amount}
                                                        </Box>
                                                        <Spacer />
                                                        <Box fontSize={"small"} textAlign={"left"}>
                                                            <Link href={"#" + item.id}>
                                                                <time dateTime={item.date}>
                                                                    {dayjs(item.date).format("YYYY-MM-DD")}
                                                                </time>
                                                            </Link>
                                                        </Box>
                                                    </Flex>
                                                    <Box color={useColorModeValue("gray.500", "gray.300")}>
                                                        <Summarize>{item.memo}</Summarize>
                                                    </Box>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </div>
                            );
                        })}
                    </Box>
                </Container>
                <Footer />
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
export async function getStaticProps({
    params
}: {
    params: {
        userId: string;
    };
}) {
    const userId = params.userId;
    const userKVS = await createUserKvs();
    const user = await userKVS.findByUserId(userId);
    if (!user) {
        throw new Error("No user");
    }
    try {
        const res = await getSpreadSheet({
            spreadsheetId: user.spreadsheetId,
            credentials: user.credentials,
            defaultCurrency: user.defaultCurrency
        });
        const markdown = createMarkdown();
        return {
            props: {
                ok: true,
                userName: user.name,
                userId: user.id,
                userAvatarUrl: user.avatarUrl,
                response: res,
                README: markdown(res[0].README)
            },
            // Next.js will attempt to re-generate the page:
            // - When a request comes in
            // - At most once x second
            revalidate: 60 // In seconds
        };
    } catch (error) {
        return {
            props: {
                errorMessage: error.message,
                ok: false
            },
            revalidate: 1 // In seconds
        };
    }
}

export default UserPage;
