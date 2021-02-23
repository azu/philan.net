import {
    Alert,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
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
    Textarea
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { AddRequestBody } from "../api/spreadsheet/api-types";
import Head from "next/head";

function userForm() {
    const [to, setTo] = useState<string>("");
    const [url, setUrl] = useState<string>("https://");
    const [amount, setAmount] = useState<number>(1000);
    const [memo, setMemo] = useState<string>("");
    const [valid, setValid] = useState<boolean>(false);
    useEffect(() => {
        const validURL = url.length > 0 ? url.startsWith("http") : true;
        const ok = to.length > 0 && validURL && amount > 0;
        console.log("ok", ok, to, validURL, amount);
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
    const [error, setError] = useState<Error | null>(null);
    const submit = () => {
        const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan-net.vercel.app";
        const body: AddRequestBody = {
            url,
            amount,
            memo,
            to
        };
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
                    return setError(null);
                }
                return res.text().then((text) => Promise.reject(new Error(text)));
            })
            .catch((error) => {
                setError(error);
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
                <title>新しい寄付先を追加する - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Container maxW="xl">
                <Box w="100%" p={4}>
                    <FormControl id="to" isRequired>
                        <FormLabel>To:</FormLabel>
                        <Input value={to} onChange={handlers.updateTo} />
                        <FormHelperText>寄付先を入力してください</FormHelperText>
                    </FormControl>
                    <FormControl id="url">
                        <FormLabel>URL:</FormLabel>
                        <Input value={url} onChange={handlers.updateUrl} />
                        <FormHelperText>httpから始まる寄付先に関連するURLを入力してください</FormHelperText>
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
                        disabled={!valid}
                        onClick={submit}
                    >
                        Submit
                    </Button>
                    {errorMessage}
                </Box>
            </Container>
        </>
    );
}
