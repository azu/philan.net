import {
    Alert,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    chakra,
    Checkbox,
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
    Text,
    Textarea
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Header } from "../../components/Header";
import COUNTRY_CURRENCY from "country-to-currency";
import { CreateUserRequestBody } from "../api/user/api-types";
import { Footer } from "../../components/Footer";

const CURRENCY_CODES = Object.values(COUNTRY_CURRENCY);

function userForm() {
    const [id, setId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [README, setREADME] = useState<string>("");
    const [defaultCurrency, setDefaultCurrency] = useState<string>("JPY");
    const [budget, setBudget] = useState<number>(10000);
    const [valid, setValid] = useState<boolean>(false);
    const [agreement, setAgreement] = useState<boolean>(false);
    useEffect(() => {
        const ok = agreement && id.length > 0 && name.length > 0 && budget > 0 && defaultCurrency.length === 3;
        setValid(ok);
    }, [id, name, budget, agreement]);
    const handlers = useMemo(
        () => ({
            updateId: (event: SyntheticEvent<HTMLInputElement>) => {
                setId(event.currentTarget.value.toLowerCase());
            },
            updateName: (event: SyntheticEvent<HTMLInputElement>) => {
                setName(event.currentTarget.value);
            },
            updateREADME: (event: SyntheticEvent<HTMLTextAreaElement>) => {
                setREADME(event.currentTarget.value);
            },
            updateBudget: (_valueAsString: string, valueAsNumber: number) => {
                setBudget(valueAsNumber);
            },
            updateDefaultCurrency: (event: SyntheticEvent<HTMLSelectElement>) => {
                setDefaultCurrency(event.currentTarget.value);
            },
            updateAgreement: (event: SyntheticEvent<HTMLInputElement>) => {
                setAgreement(event.currentTarget.checked);
            }
        }),
        [id, name, budget]
    );

    return {
        id,
        name,
        README,
        budget,
        agreement,
        defaultCurrency,
        valid,
        handlers
    };
}

export default function Create() {
    const { id, name, valid, budget, agreement, README, defaultCurrency, handlers } = userForm();
    const [error, setError] = useState<Error | null>(null);
    const submit = () => {
        const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan.net";
        fetch(HOST + "/api/user/create", {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id,
                name,
                budget,
                README,
                defaultCurrency
            })
        })
            .then((res) => {
                if (res.ok) {
                    setError(null);
                    return res.json();
                }
                return res.text().then((text) => Promise.reject(new Error(text)));
            })
            .then((json: CreateUserRequestBody) => {
                const query = new URLSearchParams([["id", json.id]]);
                window.location.href = "/philan/created?" + query.toString();
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
                            <FormControl id="id" isRequired marginBottom={6}>
                                <FormLabel>ユーザーID</FormLabel>
                                <Input value={id} onChange={handlers.updateId} pattern={"^[a-z0-9-_.]{2,255}$"} />
                                <FormHelperText>
                                    ユーザーIDはphilan.net全体でユニークである必要があります。 アルファベット、数字、
                                    <code>-</code>、<code>_</code>、<code>.</code>
                                    で構成される2文字以上の名前が利用できます。
                                </FormHelperText>
                            </FormControl>
                            <FormControl id="name" isRequired marginBottom={6}>
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
                                <FormHelperText>
                                    今年の寄付の予算額を入力してください。
                                    <br />
                                    年収の１〜２%程度を一つの目安にしてみてください。（後から変更できます）
                                </FormHelperText>
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
                            <FormControl id="README" marginBottom={6}>
                                <FormLabel>README</FormLabel>
                                <FormHelperText>
                                    あなたの自己紹介を入力してください(Markdown形式、後から変更できます)
                                </FormHelperText>
                                <Textarea height={"10em"} value={README} onChange={handlers.updateREADME} />
                            </FormControl>
                            <FormControl id="agreement" marginBottom={6}>
                                <Checkbox isChecked={agreement} onChange={handlers.updateAgreement}>
                                    <Link
                                        display="inline-block"
                                        href={"https://github.com/azu/philan.net/blob/main/docs/ja/term-of-use.md"}
                                        color="teal.500"
                                        isExternal
                                    >
                                        利用規約
                                    </Link>
                                    と
                                    <Link
                                        display="inline-block"
                                        href={"https://github.com/azu/philan.net/blob/main/docs/ja/privacy-poicy.md"}
                                        color="teal.500"
                                        isExternal
                                    >
                                        プライバシーポリシー
                                    </Link>
                                    に同意する
                                </Checkbox>
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
                <Footer />
            </Box>
        </>
    );
}
