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
    HStack,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
    Textarea,
    useRadio,
    useRadioGroup
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { AddRequestBody } from "../api/spreadsheet/api-types";
import Head from "next/head";
import { Header } from "../../components/Header";
import { UseRadioProps } from "@chakra-ui/radio/dist/types/use-radio";

const options = [
    {
        value: "checked",
        label: "寄付済み"
    },
    {
        value: "checking",
        label: "検討中"
    }
] as const;

type StateType = typeof options[number]["value"];

function RadioCard(props: UseRadioProps & { children: string }) {
    const { getInputProps, getCheckboxProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getCheckboxProps();

    return (
        <Box as="label">
            <input {...input} />
            <Box
                {...checkbox}
                cursor="pointer"
                borderWidth="1px"
                borderRadius="md"
                boxShadow="md"
                _checked={{
                    bg: "teal.600",
                    color: "white",
                    borderColor: "teal.600"
                }}
                _focus={{
                    boxShadow: "outline"
                }}
                px={5}
                py={3}
            >
                {props.children}
            </Box>
        </Box>
    );
}

function userForm() {
    const [to, setTo] = useState<string>("");
    const [url, setUrl] = useState<string>("https://");
    const [amount, setAmount] = useState<number>(1000);
    const [memo, setMemo] = useState<string>("");
    const [valid, setValid] = useState<boolean>(false);
    const [type, setType] = useState<StateType>("checked");
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
            updateType: (type: StateType) => {
                setType(type);
            },
            updateAmount: (_valueAsString: string, valueAsNumber: number) => {
                setAmount(valueAsNumber);
            },
            updateMemo: (event: SyntheticEvent<HTMLTextAreaElement>) => {
                setMemo(event.currentTarget.value);
            }
        }),
        [to, url, amount, memo, type]
    );

    return {
        to,
        url,
        amount,
        memo,
        type,
        valid,
        handlers
    };
}

export default function Create() {
    const { url, amount, memo, to, type, valid, handlers } = userForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const submit = () => {
        const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan-net.vercel.app";
        const body: AddRequestBody = {
            url,
            amount: type === "checked" ? amount : 0,
            memo,
            to,
            meta: {
                type: type
            }
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
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "type",
        defaultValue: type,
        onChange: handlers.updateType
    });
    const group = getRootProps();
    const RadioGroup = (
        <HStack {...group}>
            {options.map(({ label, value }) => {
                const radio = getRadioProps({ value });
                return (
                    <RadioCard key={value} {...radio}>
                        {label}
                    </RadioCard>
                );
            })}
        </HStack>
    );
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
                            <Box border="1px" borderColor="gray.200" borderRadius={8}>
                                {RadioGroup}
                                <FormControl
                                    id="amount"
                                    isRequired={type === "checked"}
                                    isDisabled={type === "checking"}
                                >
                                    <FormLabel>寄付額</FormLabel>
                                    <NumberInput
                                        value={amount}
                                        max={100000000000}
                                        min={1}
                                        onChange={handlers.updateAmount}
                                    >
                                        <NumberInputField />
                                        {type === "checked" ? (
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        ) : null}
                                    </NumberInput>
                                    <FormHelperText>寄付済みの場合は寄付した金額を入力してください</FormHelperText>
                                </FormControl>
                            </Box>
                            <FormControl id="memo">
                                <FormLabel>Memo:</FormLabel>
                                <FormHelperText>メモ欄(Markdown)</FormHelperText>
                                <Textarea height={"10em"} value={memo} onChange={handlers.updateMemo} />
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
