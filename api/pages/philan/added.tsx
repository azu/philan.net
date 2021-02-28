import {
    Box,
    IconButton,
    chakra,
    Container,
    Link,
    ListItem,
    Spinner,
    Text,
    UnorderedList,
    Editable
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { SiTwitter } from "react-icons/si";
import { Header } from "../../components/Header";

const Messages = [
    <Box>
        幸せな人はより多く寄付し、寄付することは幸せになるという正のフィードバックループがある
        <br />
        <Link isExternal={true} color="teal.500" href={"https://science.sciencemag.org/content/316/5831/1622.abstract"}>
            HARBAUGH, William T.; MAYR, Ulrich; BURGHART, Daniel R. Neural responses to taxation and voluntary giving
            reveal motives for charitable donations. Science, 2007, 316.5831: 1622-1625.
        </Link>
    </Box>,
    <Box align={"left"}>
        寄付が難しいという感覚は、稼いだお金を手放さないといけないとう苦痛から来ている。
        <br />
        寄付をするという長期的な目標を満たすためには、事前に寄付する額を決めておくプレコミットメントが有効とされている。
        <br />
        <UnorderedList>
            <ListItem>
                <Link
                    isExternal={true}
                    color="teal.500"
                    href={"https://journals.sagepub.com/doi/abs/10.1111/1467-9280.00441"}
                >
                    ARIELY, Dan; WERTENBROCH, Klaus. Procrastination, deadlines, and performance: Self-control by
                    precommitment. Psychological science, 2002, 13.3: 219-224.
                </Link>
            </ListItem>
            <ListItem>
                <Link isExternal={true} color="teal.500" href={"https://www.amazon.co.jp/dp/B004QM9VT4/"}>
                    The Science of Giving: Experimental Approaches to the Study of Charity (The Society for Judgment and
                    Decision Making Series)
                </Link>
            </ListItem>
        </UnorderedList>
    </Box>
] as const;
export default function Created() {
    const [userId, setUserId] = useState<string>("");
    const [message, setMessage] = useState<string | JSX.Element>("");
    const [tweet, setTweet] = useState<string>("");
    useEffect(() => {
        setMessage(Messages[Math.floor(Math.random() * Messages.length)]);
        const url = new URL(location.href);
        const id = url.searchParams.get("id");
        if (!id) {
            return;
        }
        setUserId(id);
        const to = url.searchParams.get("to");
        const amount = url.searchParams.get("amount");
        const currency = url.searchParams.get("currency");
        const formattedAmount =
            amount && currency
                ? new Intl.NumberFormat(new Intl.NumberFormat().resolvedOptions().locale, {
                      style: "currency",
                      currency: currency
                  }).format(Number(amount))
                : "";
        if (to && formattedAmount) {
            setTweet(`${to} に対して ${formattedAmount} 寄付しました！`);
        } else if (to) {
            setTweet(`${to} に対して寄付しました！`);
        } else {
            setTweet(`寄付しました！`);
        }
        // setTimeout(() => {
        //     location.href = `/user/${id}`;
        // }, 60 * 1000);
    }, []);
    const goToTweet = useCallback(() => {
        const userPage = `https://philan.net/user/${userId}`;
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(userPage)}&text=${encodeURIComponent(
            tweet
        )}&hashtags=philannet`;
        window.open(url, "_blank");
    }, [userId, tweet]);
    return (
        <>
            <Head>
                <title>新しい寄付の記録に成功🎉 - philan.net</title>
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
                            新しい寄付の記録に成功しました🎉
                        </chakra.h1>
                        <Box
                            mx="auto"
                            fontSize={{ base: "lg", lg: "xl" }}
                            my="4"
                            padding={12}
                            border="1px"
                            borderColor="gray.200"
                            borderRadius={8}
                        >
                            <Editable color="gray.500">{tweet}</Editable>
                            <IconButton
                                colorScheme="blue"
                                aria-label="Tweet!"
                                icon={<SiTwitter />}
                                onClick={goToTweet}
                            />
                        </Box>

                        <Box opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} my="4">
                            <Text>
                                ユーザーページを生成中です（最大1~2分程度かかります）
                                <Spinner as="span" label={"ユーザーページの再構築中"}></Spinner>
                            </Text>
                        </Box>
                        <Container padding={12} border="1px" borderColor="gray.200" borderRadius={8}>
                            {message}
                        </Container>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
