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
    Skeleton,
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
import NextError from "next/error";
import { Header } from "../../components/Header";
import { BellIcon, CheckCircleIcon, ChevronUpIcon } from "@chakra-ui/icons";
import dayjs from "dayjs";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import type { GetResponseBody } from "../api/spreadsheet/api-types";
import { getSpreadSheet } from "../api/spreadsheet/get";
import { createUserKvs } from "../../api-utils/userKvs";
import Head from "next/head";
import { Footer } from "../../components/Footer";
import { MarkdownStyle } from "../../components/MarkdownStyle";
import { useLoginUser } from "../../components/useLoginUser";
import markdownIt from "markdown-it";
import { useRouter } from "next/router";

const md = markdownIt();
const markdown = (str: string) => md.render(str);
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
type ErrorUserPageProps = {
    errorCode: number;
    errorMessage: string;
};

function ErrorUserPage(props: ErrorUserPageProps) {
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
                            <chakra.pre whiteSpace={"normal"}>Error: {props.errorMessage}</chakra.pre>
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

type UserPageContentProps = {
    README: string;
    userName: string;
    userAvatarUrl?: string;
    userId: string;
    response: GetResponseBody;
};

const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan.net";

const isUserPageContentProps = (props: UserPageContentProps | {}): props is UserPageContentProps => {
    return "userId" in props;
};
const useUserPageContent = (props: UserPageContentProps | {}) => {
    const router = useRouter();
    const isFallback = router.isFallback;
    const user = useLoginUser();
    const README = isUserPageContentProps(props) ? props.README : "";
    const userId = isUserPageContentProps(props) ? props.userId : "";
    const userName = isUserPageContentProps(props) ? props.userName : "";
    const userAvatarUrl = isUserPageContentProps(props) ? props.userAvatarUrl : "";
    // @ts-expect-error this will avoid to useEffect updates
    const response = props.response;
    const [records, setRecords] = useState<GetResponseBody>(response ?? []);
    const feedURL = useMemo(() => `${HOST}/user/${userId}/feed`, [userId]);
    const isLoaded = useMemo(() => userId !== "", [userId]);
    useEffect(() => {
        if (response) {
            setRecords(response);
        }
    }, [response]);
    useEffect(() => {
        async function main() {
            if (isFallback) {
                return; // fallback = fresh data
            }
            if (!user) {
                return; // no fetch
            }
            if (user.id !== userId) {
                return; // no fetch different user
            }
            const spreadSheetRecords = await fetch("/api/spreadsheet/get").then((res) => res.json());
            setRecords(spreadSheetRecords);
        }

        main();
    }, [isFallback, user, userId]);
    return [{ isLoaded, feedURL, records, README, userId, userName, userAvatarUrl }] as const;
};

const UserPageContent: FC<UserPageContentProps> = (props: UserPageContentProps) => {
    const { colorMode } = useColorMode();
    const boxColor = useColorModeValue("gray.500", "gray.300");
    const styleGenerator = useCallback(() => MarkdownStyle(colorMode), [colorMode]);
    const [{ isLoaded, README, feedURL, records, userAvatarUrl, userName }] = useUserPageContent(props);
    return (
        <>
            <Head>
                <title>{userName || "………"} - philan.net</title>
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
                                    <Skeleton isLoaded={isLoaded}>
                                        <Img
                                            width="96px"
                                            height="96px"
                                            boxSize="96px"
                                            borderRadius="full"
                                            objectFit="cover"
                                            alt={""}
                                            src={userAvatarUrl}
                                            loading={"eager"}
                                        />
                                    </Skeleton>
                                </Box>
                                <Box paddingX={4}>
                                    <Heading as="h1" size="xl" mt="1em" mb="0.5em">
                                        {!isLoaded && <Skeleton height="40px" width="120px" />}
                                        {userName}
                                    </Heading>
                                </Box>
                            </Flex>
                            <Box maxW="32rem">
                                <Skeleton isLoaded={isLoaded} height="40px">
                                    <div
                                        className={"UserContent"}
                                        dangerouslySetInnerHTML={{
                                            __html: README
                                        }}
                                    />
                                </Skeleton>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Box>
            <Box marginTop={{ base: "60px" }} mb="60px">
                <Container maxWidth={"80ch"}>
                    <Box padding={"2"}>
                        {records.map((item) => {
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
                                            const SiteName =
                                                safeUrl !== "" ? (
                                                    <Link
                                                        href={safeUrl}
                                                        borderBottom={"1px"}
                                                        borderColor={"blue.200"}
                                                        isExternal={true}
                                                    >
                                                        {item.to}
                                                    </Link>
                                                ) : (
                                                    `${item.to}`
                                                );
                                            return (
                                                <ListItem key={item.id} id={item.id}>
                                                    <Flex alignItems={"baseline"}>
                                                        <Box padding="2">
                                                            {Icon}
                                                            {SiteName}
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
                                                    <Box color={boxColor}>
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
};

type UserPageProps = ErrorUserPageProps | UserPageContentProps;
const isErrorUserPageProps = (props: UserPageProps): props is ErrorUserPageProps => {
    return "errorCode" in props;
};

function UserPage(props: UserPageProps) {
    if (isErrorUserPageProps(props)) {
        return (
            <NextError title={"Error:" + props.errorMessage} statusCode={props.errorCode}>
                <ErrorUserPage {...props} />
            </NextError>
        );
    } else {
        return <UserPageContent {...props} />;
    }
}

export async function getStaticPaths() {
    return { paths: [], fallback: true }; // props will be {}
}

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
        return {
            props: {
                errorCode: 400,
                errorMessage: "No user"
            },
            revalidate: 1
        };
    }
    try {
        const res = await getSpreadSheet({
            spreadsheetId: user.spreadsheetId,
            credentials: user.credentials,
            defaultCurrency: user.defaultCurrency
        });
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
    } catch (error: any) {
        return {
            props: {
                errorCode: 500,
                errorMessage: error.message
            },
            revalidate: 1
        };
    }
}

export default UserPage;
