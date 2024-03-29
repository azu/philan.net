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

function useForm(user: LoginUser | null) {
    const [id, setId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [defaultCurrency, setDefaultCurrency] = useState<string>("JPY");
    const [spreadsheetId, setspreadsheetId] = useState<string>("");
    const [valid, setValid] = useState<boolean>(false);
    useEffect(() => {
        const ok = id.length > 0 && name.length > 0 && spreadsheetId.length > 0 && defaultCurrency.length === 3;
        setValid(ok);
    }, [defaultCurrency, id, name, spreadsheetId]);
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
            updateSpreadSheetId: (event: SyntheticEvent<HTMLInputElement>) => {
                setspreadsheetId(event.currentTarget.value);
            },
            updateDefaultCurrency: (event: SyntheticEvent<HTMLSelectElement>) => {
                setDefaultCurrency(event.currentTarget.value);
            }
        }),
        []
    );

    return {
        id,
        name,
        spreadsheetId,
        defaultCurrency,
        valid,
        handlers
    };
}

export default function Create() {
    const user = useLoginUser();
    const { id, name, valid, spreadsheetId, defaultCurrency, handlers } = useForm(user);
    const [error, setError] = useState<Error | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const submit = () => {
        fetch("/api/user/update", {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                name,
                defaultCurrency
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
                            <FormControl id="id" isDisabled={true} marginBottom={6}>
                                <FormLabel>ユーザーID</FormLabel>
                                <Input value={id} onChange={handlers.updateId} />
                                <FormHelperText>
                                    ユーザーIDはphilan.net全体でユニークである必要があります。
                                </FormHelperText>
                            </FormControl>
                            <FormControl id="name" isRequired marginBottom={6}>
                                <FormLabel>ユーザー名</FormLabel>
                                <Input value={name} onChange={handlers.updateName} />
                                <FormHelperText>ユーザー名は表示のために使われる名前です</FormHelperText>
                            </FormControl>
                            <FormControl id={"defaultCurrency"} isRequired marginBottom={6}>
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
                            <FormControl id={"SpreadSheet ID"} isDisabled={true} marginBottom={6}>
                                <FormLabel>SpreadSheet ID</FormLabel>
                                <Input value={spreadsheetId} onChange={handlers.updateSpreadSheetId} />
                                <FormHelperText>
                                    紐付いているGoogle SpreadSheetのIDです。
                                    <code>https://docs.google.com/spreadsheets/d/ID</code>のIDのみの値です。
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
