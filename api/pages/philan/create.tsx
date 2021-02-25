import {
    Alert,
    AlertTitle,
    AlertIcon,
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
    chakra,
    Text
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Header } from "../../components/Header";

function userForm() {
    const [id, setId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [budget, setBudget] = useState<number>(10000);
    const [valid, setValid] = useState<boolean>(false);
    useEffect(() => {
        const ok = id.length > 0 && name.length > 0 && budget > 0;
        setValid(ok);
    }, [id, name, budget]);
    const handlers = useMemo(
        () => ({
            updateId: (event: SyntheticEvent<HTMLInputElement>) => {
                setId(event.currentTarget.value);
            },
            updateName: (event: SyntheticEvent<HTMLInputElement>) => {
                setName(event.currentTarget.value);
            },
            updateBudget: (_valueAsString: string, valueAsNumber: number) => {
                setBudget(valueAsNumber);
            }
        }),
        [id, name, budget]
    );

    return {
        id,
        name,
        budget,
        valid,
        handlers
    };
}

export default function Create() {
    const { id, name, valid, budget, handlers } = userForm();
    const [error, setError] = useState<Error | null>(null);
    const submit = () => {
        const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan-net.vercel.app";

        fetch(HOST + "/api/user/create", {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                name,
                budget
            })
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
                <title>ユーザーを登録する - philan.net</title>
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
                            ユーザーを登録
                        </chakra.h1>
                        <Text maxW="560px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                            philan.netにユーザーアカウントを作成します。
                            <br />
                            アカウントに必要な情報を入力してください。
                        </Text>
                    </Box>
                    <Container maxW="xl">
                        <Box w="100%" p={4}>
                            <FormControl id="id" isRequired>
                                <FormLabel>ユーザーID</FormLabel>
                                <Input value={id} onChange={handlers.updateId} />
                                <FormHelperText>
                                    ユーザーIDはphilan.net全体でユニークである必要があります。
                                </FormHelperText>
                            </FormControl>
                            <FormControl id="name" isRequired>
                                <FormLabel>ユーザー名</FormLabel>
                                <Input value={name} onChange={handlers.updateName} />
                                <FormHelperText>ユーザー名は表示のために使われる名前です</FormHelperText>
                            </FormControl>
                            <FormControl id="amount" isRequired>
                                <FormLabel>寄付の予算</FormLabel>
                                <NumberInput
                                    value={budget}
                                    max={100000000000}
                                    min={100}
                                    onChange={handlers.updateBudget}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                <FormHelperText>今年の寄付の予算額を入力してください。</FormHelperText>
                            </FormControl>
                            <Button
                                mt={4}
                                colorScheme="teal"
                                isLoading={false}
                                type="submit"
                                disabled={!valid}
                                onClick={submit}
                            >
                                登録
                            </Button>
                            {errorMessage}
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
}
