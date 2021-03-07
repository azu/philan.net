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
    Link,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Text
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Header } from "../../components/Header";
import COUNTRY_CURRENCY from "country-to-currency";
import { LoginUser, useLoginUser } from "../../components/useLoginUser";
import { Footer } from "../../components/Footer";

const CURRENCY_CODES = Object.values(COUNTRY_CURRENCY);

function userForm(user: LoginUser | null) {
    const [id, setId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [defaultCurrency, setDefaultCurrency] = useState<string>("JPY");
    const [spreadsheetId, setspreadsheetId] = useState<string>("");
    const [budget, setBudget] = useState<number>(10000);
    const [valid, setValid] = useState<boolean>(false);
    useEffect(() => {
        const ok =
            id.length > 0 && name.length > 0 && spreadsheetId.length > 0 && budget > 0 && defaultCurrency.length === 3;
        setValid(ok);
    }, [id, name, budget, spreadsheetId]);
    useEffect(() => {
        if (!user) {
            return;
        }
        setId(user.id);
        setName(user.name);
        setDefaultCurrency(user.defaultCurrency);
        const spreadsheetId = user.spreadsheetUrl.replace(
            /https:\/\/docs\.google\.com\/spreadsheets\/([^\/]+)\//,
            "$1"
        );
        setspreadsheetId(spreadsheetId);
    }, [user]);
    const handlers = useMemo(
        () => ({
            updateId: (event: SyntheticEvent<HTMLInputElement>) => {
                setId(event.currentTarget.value);
            },
            updateName: (event: SyntheticEvent<HTMLInputElement>) => {
                setName(event.currentTarget.value);
            },
            updatespreadsheetId: (event: SyntheticEvent<HTMLInputElement>) => {
                setspreadsheetId(event.currentTarget.value);
            },
            updateBudget: (_valueAsString: string, valueAsNumber: number) => {
                setBudget(valueAsNumber);
            },
            updateDefaultCurrency: (event: SyntheticEvent<HTMLSelectElement>) => {
                setDefaultCurrency(event.currentTarget.value);
            }
        }),
        [id, name, budget]
    );

    return {
        id,
        name,
        budget,
        spreadsheetId,
        defaultCurrency,
        valid,
        handlers
    };
}

export default function Create() {
    const user = useLoginUser();
    const { id, name, valid, spreadsheetId, budget, defaultCurrency, handlers } = userForm(user);
    const [error, setError] = useState<Error | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const submit = () => {
        const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan.net";
        fetch(HOST + "/api/user/update", {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                name,
                budget,
                defaultCurrency,
                spreadsheetId
            })
        })
            .then((res) => {
                if (res.ok) {
                    setSuccess(true);
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
    const successMessage =
        !error && success ? (
            <Alert status="success">
                <AlertIcon />
                <AlertTitle mr={2}>Success to update!</AlertTitle>
            </Alert>
        ) : null;
    return (
        <>
            <Head>
                <title>ユーザー情報の更新 - philan.net</title>
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
                            ユーザー情報の更新
                        </chakra.h1>
                        <Text maxW="560px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                            ユーザー情報を更新します。
                        </Text>
                    </Box>
                    <Container maxW="xl">
                        <Box w="100%" p={4}>
                            <FormControl id="id" isDisabled={true}>
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
                            <FormControl id={"defaultCurrency"} isRequired>
                                <FormLabel>デフォルトの通貨</FormLabel>
                                <Select value={defaultCurrency} onChange={handlers.updateDefaultCurrency}>
                                    {CURRENCY_CODES.map((currencyCode, index) => {
                                        return (
                                            <option key={currencyCode + index} value={currencyCode}>
                                                {currencyCode}
                                            </option>
                                        );
                                    })}
                                </Select>
                                <FormHelperText>
                                    金額を入力する際のデフォルトの通貨の単位を入力してください。
                                    <br />
                                    通貨コードは
                                    <Link color="teal.500" href={"https://en.wikipedia.org/wiki/ISO_4217#Active_codes"}>
                                        ISO 4217
                                    </Link>
                                    に基づきます。日本円はJPYです。
                                </FormHelperText>
                            </FormControl>
                            <FormControl id={"SpreadSheet ID"} isRequired>
                                <FormLabel>SpreadSheet ID</FormLabel>
                                <Input value={spreadsheetId} onChange={handlers.updatespreadsheetId} />
                                <FormHelperText>
                                    紐付けるGoogle SpreadSheetのIDを入力してください。
                                    <code>https://docs.google.com/spreadsheets/d/ID</code>のIDのみを入力してください。
                                </FormHelperText>
                            </FormControl>
                            <Button
                                mt={4}
                                colorScheme="teal"
                                isLoading={false}
                                type="submit"
                                disabled={!valid}
                                onClick={submit}
                            >
                                更新
                            </Button>
                            {errorMessage}
                            {successMessage}
                        </Box>
                    </Container>
                </Box>
                <Footer />
            </Box>
        </>
    );
}
