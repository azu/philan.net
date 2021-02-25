import {
    Alert,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    chakra,
    Container,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
    Textarea
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { AddRequestBody } from "../api/spreadsheet/api-types";
import Head from "next/head";
import { Header } from "../../components/Header";

function userForm() {
    const [to, setTo] = useState<string>("");
    const [url, setUrl] = useState<string>("https://");
    const [amount, setAmount] = useState<number>(1000);
    const [memo, setMemo] = useState<string>("");
    const [valid, setValid] = useState<boolean>(false);
    useEffect(() => {
        const validURL = url.length > 0 ? url.startsWith("http") : true;
        const ok = to.length > 0 && validURL && amount > 0;
        setValid(ok);
    }, [to, url, amount, memo]);
    const handlers = useMemo(
        () => ({
            updateTo: (event: SyntheticEvent<HTMLInputElement>) => {
                setTo(event.currentTarget.value);
            },
            updateUrl: (event: SyntheticEvent<HTMLInputElement>) => {
                setUrl(event.currentTarget.value);
            },
            updateAmount: (_valueAsString: string, valueAsNumber: number) => {
                setAmount(valueAsNumber);
            },
            updateMemo: (event: SyntheticEvent<HTMLTextAreaElement>) => {
                setMemo(event.currentTarget.value);
            }
        }),
        [to, url, amount, memo]
    );

    return {
        to,
        url,
        amount,
        memo,
        valid,
        handlers
    };
}

export default function Create() {
    const { url, amount, memo, to, valid, handlers } = userForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const submit = () => {
        const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan-net.vercel.app";
        const body: AddRequestBody = {
            url,
            amount,
            memo,
            to
        };
        setLoading(true);
        fetch(HOST + "/api/spreadsheet/add", {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                return res.text().then((text) => Promise.reject(new Error(text)));
            })
            .then((json) => {
                setError(null);
                window.location.href = json.pageURL;
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const errorMessage = error ? (
        <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>{error.message}</AlertTitle>
        </Alert>
    ) : null;
    return (
        <>
            <Head>
                <title>新しい寄付の記録を追加する - philan.net</title>
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
                            新しい寄付の記録を追加
                        </chakra.h1>
                        <Text maxW="560px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                            新しい寄付の記録を追加してみよう。
                            <br />
                            寄付の記録の一覧に追加されます。
                        </Text>
                    </Box>

                    <Container maxW="xl">
                        <Box w="100%" p={4}>
                            <FormControl id="to" isRequired>
                                <FormLabel>寄付先:</FormLabel>
                                <Input value={to} onChange={handlers.updateTo} />
                                <FormHelperText>寄付先の名前(法人、人、場所など)を入力してください</FormHelperText>
                            </FormControl>
                            <FormControl id="url">
                                <FormLabel>URL:</FormLabel>
                                <Input value={url} onChange={handlers.updateUrl} />
                                <FormHelperText>寄付先に関連するhttpから始まるURLを入力してください</FormHelperText>
                            </FormControl>
                            <FormControl id="amount" isRequired>
                                <FormLabel>寄付額</FormLabel>
                                <NumberInput value={amount} max={100000000000} min={1} onChange={handlers.updateAmount}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                            <FormControl id="memo">
                                <FormLabel>Memo:</FormLabel>
                                <FormHelperText>メモ欄(Markdown)</FormHelperText>
                                <Textarea value={memo} onChange={handlers.updateMemo} />
                            </FormControl>
                            <Button
                                mt={4}
                                colorScheme="teal"
                                isLoading={false}
                                type="submit"
                                disabled={!valid || loading}
                                onClick={submit}
                            >
                                Submit
                            </Button>
                            {errorMessage}
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
}
