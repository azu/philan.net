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
    Button,
    Grid,
    Heading,
    Icon,
    Alert,
    AlertIcon,
    VStack
} from "@chakra-ui/react";
import React from "react";
import { ArrowForwardIcon, ArrowRightIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { MdAccessibility, MdGrain, MdPalette } from "react-icons/md";
import NextLink from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const Feature = ({ title, icon, children, ...props }: any) => {
    return (
        <Box bg={useColorModeValue("white", "gray.700")} rounded="12px" shadow="base" padding="40px" {...props}>
            <Flex rounded="full" w="12" h="12" bg="teal.500" align="center" justify="center">
                <Icon fontSize="24px" color="white" as={icon} />
            </Flex>
            <Heading as="h3" size="md" fontWeight="semibold" mt="1em" mb="0.5em">
                {title}
            </Heading>
            <Text fontSize="lg" opacity={0.7}>
                {children}
            </Text>
        </Box>
    );
};

const IndexPage = (props: { users: string[] }) => {
    return (
        <>
            <Head>
                <title>philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Header />
            <Box mb={20}>
                <Box>
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

                                <VStack mt="10" spacing="4" justify="center" direction={{ base: "column", sm: "row" }}>
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
                                    <Alert
                                        status="info"
                                        backgroundColor={"transparent"}
                                        borderBottom={"1px"}
                                        borderColor={useColorModeValue("teal.500", "teal.300")}
                                    >
                                        <AlertIcon />
                                        <Text opacity={0.7} fontSize={{ base: "s" }}>
                                            SpreadSheetにデータを記録するため、Googleアカウントが必要です。
                                            必要なパーミッションの解説は
                                            <Link
                                                color="teal.500"
                                                isExternal={true}
                                                href={"https://github.com/azu/philan.net#permission"}
                                            >
                                                README
                                                <ExternalLinkIcon verticalAlign={"baseline"} mx="2px" />
                                            </Link>
                                            を参照してください。
                                        </Text>
                                    </Alert>
                                </VStack>
                            </Box>
                        </Container>
                    </Box>
                </Box>
                <Box>
                    <Container maxW="1280px">
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
                                <Box as="span" color={useColorModeValue("teal.500", "teal.300")}>
                                    Features
                                </Box>
                            </chakra.h1>
                        </Box>
                        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4} padding={4}>
                            <Feature icon={MdAccessibility} title="寄付の予算">
                                寄付をする年間の予算を決定できます。
                                <br />
                                「寄付が難しい」という感覚は、得たお金を手放さないと行けないという苦痛から来ています。この苦痛を和らげる方法として、事前に寄付する金額を決めておくプレミコミットメントの手法が有効です。
                            </Feature>
                            <Feature icon={MdPalette} title="データはSpreadSheetに記録">
                                寄付の記録はすべてGoogle SpreadSheetに記録されます。
                                <br />
                                philan.netを使わなくなってもデータは常にあなたの手元に残ります。
                            </Feature>
                            <Feature icon={MdGrain} title="寄付の記録を公開">
                                あなたの寄付の記録を公開できます。
                                <br />
                                あなたがいつ、どこへ、いくら、なぜ寄付したのかを記録し、あなたの寄付の記録として公開できます。
                            </Feature>
                            <Feature icon={MdGrain} title="寄付の記録を簡単追加">
                                ログインすることで寄付の記録を簡単に追加できます。
                                <br />
                                記録したデータはGoogle SpreadSheetに追記されます。
                            </Feature>
                        </Grid>
                    </Container>
                </Box>
                <Box padding={"8"} backgroundColor={useColorModeValue("teal.500", "teal.300")}>
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
                            <Box as="span" color={"whiteAlpha.900"}>
                                Try philan.net
                            </Box>
                        </chakra.h1>
                        <Box>
                            <chakra.h2
                                maxW="30ch"
                                mx="auto"
                                fontSize={{ base: "1.25rem", sm: "1rem", lg: "2rem" }}
                                color={"whiteAlpha.800"}
                                fontFamily="heading"
                                letterSpacing="tighter"
                                mb="16px"
                                lineHeight="1.2"
                            >
                                Googleアカウントでログインすると記録用のSpreadSheetが作成されます！
                            </chakra.h2>
                            <NextLink href="/api/auth" passHref>
                                <Button
                                    h="4rem"
                                    px="40px"
                                    fontSize="1.2rem"
                                    as="a"
                                    size="lg"
                                    colorScheme={"yellow"}
                                    rightIcon={<ArrowRightIcon />}
                                >
                                    Login with Google
                                </Button>
                            </NextLink>
                        </Box>
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
                            <List fontSize={{ base: "1.25rem", sm: "1.5rem", lg: "2.5rem" }}>
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
                <Footer />
            </Box>
        </>
    );
};

export async function getStaticProps() {
    const users = await getUserList();
    return {
        props: {
            users
        }
    };
}

export default IndexPage;
