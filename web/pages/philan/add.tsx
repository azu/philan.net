import {
    Alert,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Center,
    chakra,
    Container,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    HStack,
    Input,
    NumberInput,
    NumberInputField,
    Select,
    Text,
    Textarea,
    Tooltip,
    useColorModeValue,
    useRadio,
    useRadioGroup
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";
import { AddRequestBody, GetResponseBody, SpreadSheetItem } from "../api/spreadsheet/api-types";
import Head from "next/head";
import { Header } from "../../components/Header";
import { UseRadioProps } from "@chakra-ui/radio/dist/types/use-radio";
import COUNTRY_CURRENCY from "country-to-currency";
import { LoginUser, useLoginUser } from "../../components/useLoginUser";
import dayjs from "dayjs";
import { Footer } from "../../components/Footer";
import { createItemId } from "../../api-utils/create-item-id";
import AutoCompleteSelect from "react-select";
import { ActionMeta } from "react-select/src/types";

const CURRENCY_CODES = Object.values(COUNTRY_CURRENCY);
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
export const TopBanner = () => {
    return (
        <Center py="2" px="3" bgGradient="linear(to-r,cyan.700, purple.500)" color="white" textAlign="center">
            <Flex align="center" fontSize="sm">
                <Text fontWeight="medium" maxW={{ base: "32ch", md: "unset" }}>
                    2022年の予算は
                </Text>
                <chakra.a
                    flexShrink={0}
                    href={"/philan/budget?year=2022"}
                    marginLeft="4"
                    marginRight="4"
                    bg="blackAlpha.300"
                    color="whiteAlpha.900"
                    fontWeight="semibold"
                    px="3"
                    py="1"
                    rounded="base"
                >
                    予算ページ
                </chakra.a>
                から入力できます。
            </Flex>
        </Center>
    );
};

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

const useForm = (user: LoginUser | null) => {
    const [date, setDate] = useState<Date>(new Date());
    const [to, setTo] = useState<string>("");
    const [url, setUrl] = useState<string>("https://");
    const [amount, setAmount] = useState<number>(1000);
    const [memo, setMemo] = useState<string>("");
    const [valid, setValid] = useState<boolean>(false);
    const [type, setType] = useState<StateType>("checked");
    const [currency, setCurrencyCode] = useState<string>("JPY");

    const [selectOptions, setSelectOptions] = useState<SelectItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        (async function loadSelect() {
            const json: GetResponseBody = await fetch("/api/spreadsheet/get").then((res) => res.json());
            const items: SelectItem[] = [];
            json.forEach((yearData) => {
                yearData.items.forEach((item) => {
                    // filter duplicate item
                    if (
                        items.some((existingItem) => {
                            return (
                                existingItem.amount.value === item.amount.value &&
                                existingItem.to === item.to &&
                                existingItem.url === item.url
                            );
                        })
                    ) {
                        return;
                    }
                    items.push({
                        label: item.to,
                        value: item.id,
                        ...item
                    });
                });
            });
            setSelectOptions(items);
            setIsLoading(false);
        })();
    }, []);
    useEffect(() => {
        const validURL = url.length > 0 ? url.startsWith("http") : true;
        const ok = to.length > 0 && validURL && amount > 0;
        setValid(ok);
    }, [to, url, amount, memo, currency]);
    useEffect(() => {
        if (user) {
            setCurrencyCode(user.defaultCurrency);
        }
    }, [user]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
    const handlers = useMemo(
        () => ({
            updateDate: (event: SyntheticEvent<HTMLInputElement>) => {
                if (event.currentTarget.valueAsDate) {
                    setDate(event.currentTarget.valueAsDate);
                }
            },
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
                if (Number.isNaN(amount)) {
                    setAmount(0);
                } else {
                    setAmount(valueAsNumber);
                }
            },
            updateMemo: (event: SyntheticEvent<HTMLTextAreaElement>) => {
                setMemo(event.currentTarget.value);
            },
            updateCurrency: (event: SyntheticEvent<HTMLSelectElement>) => {
                setCurrencyCode(event.currentTarget.value);
            },
            updateSelect: (value: SelectItem, _actionMeta: ActionMeta<any>) => {
                setTo(value.to);
                setUrl(value.url);
                setAmount(value.amount.raw);
                setCurrencyCode(value.amount.inputCurrency);
                setMemo(value.memo);
                setType(value.meta.type);
            },
            submit: () => {
                if (!user) {
                    return setSubmitError(new Error("require login"));
                }
                const finalAmount = type === "checked" ? amount : 0;
                const isoDate = date.toISOString();
                const id = createItemId({
                    dateString: isoDate,
                    amountNumber: amount,
                    url
                });
                const body: AddRequestBody = {
                    isoDate: isoDate,
                    url,
                    amount: finalAmount,
                    memo,
                    to,
                    currency,
                    meta: {
                        id,
                        type
                    }
                };
                setIsSubmitting(true);
                fetch("/api/spreadsheet/add", {
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
                    .then(() => {
                        setSubmitSuccess(true);
                        setSubmitError(null);
                        const query = new URLSearchParams([
                            ["id", user.id],
                            ["to", to],
                            ["type", type],
                            ["amount", String(finalAmount)],
                            ["currency", currency]
                        ]);
                        window.location.href = "/philan/added?" + query.toString();
                    })
                    .catch((error) => {
                        setSubmitError(error);
                    })
                    .finally(() => {
                        setIsSubmitting(false);
                    });
            }
        }),
        [amount, user, type, date, url, memo, to, currency]
    );

    return {
        date,
        to,
        url,
        amount,
        memo,
        type,
        currency,
        valid,
        isLoading,
        selectOptions,
        isSubmitting,
        submitError,
        submitSuccess,
        handlers
    };
};

type SelectItem = { label: string; value: string } & SpreadSheetItem;
export default function Create() {
    const user = useLoginUser();
    const {
        date,
        url,
        amount,
        memo,
        to,
        type,
        currency,
        valid,
        isLoading,
        selectOptions,
        isSubmitting,
        submitError,
        submitSuccess,
        handlers
    } = useForm(user);
    const formattedAmount = useMemo(() => {
        return new Intl.NumberFormat(new Intl.NumberFormat().resolvedOptions().locale, {
            style: "currency",
            currency: currency
        }).format(amount);
    }, [amount, currency]);

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: "type",
        defaultValue: type,
        onChange: handlers.updateType
    });
    const group = getRootProps();
    const RadioGroup = (
        <HStack {...group} paddingY={4}>
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
    const errorMessage = submitError ? (
        <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>{submitError.message}</AlertTitle>
        </Alert>
    ) : null;
    const successMessage =
        !submitError && submitSuccess ? (
            <Alert status="success">
                <AlertIcon />
                <AlertTitle mr={2}>Success to update!</AlertTitle>
            </Alert>
        ) : null;
    return (
        <>
            <Head>
                <title>新しい寄付の記録を追加する - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <TopBanner />
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
                            <FormControl
                                id={"clone-records"}
                                paddingBottom={6}
                                marginBottom={6}
                                color={useColorModeValue("gray.900", "gray.700")}
                                borderBottom="1px"
                                borderColor="gray.200"
                            >
                                <FormLabel>過去の記録から入力する:</FormLabel>
                                <AutoCompleteSelect
                                    inputId="clone-records-select"
                                    options={selectOptions}
                                    isDisabled={isLoading}
                                    onChange={handlers.updateSelect}
                                />
                                <FormHelperText>過去の記録を選択して、入力欄に内容をコピーできます</FormHelperText>
                            </FormControl>
                            <FormControl id="date" isRequired marginBottom={6}>
                                <FormLabel>日付:</FormLabel>
                                <Input
                                    type="date"
                                    value={dayjs(date).format("YYYY-MM-DD")}
                                    onChange={handlers.updateDate}
                                />
                                <FormHelperText>寄付した日付</FormHelperText>
                            </FormControl>
                            <FormControl id="to" isRequired marginBottom={6}>
                                <FormLabel>寄付先:</FormLabel>
                                <Input value={to} onChange={handlers.updateTo} />
                                <FormHelperText>寄付先の名前(法人、人、場所など)を入力してください</FormHelperText>
                            </FormControl>
                            <FormControl id="url" marginBottom={6}>
                                <FormLabel>URL:</FormLabel>
                                <Input value={url} onChange={handlers.updateUrl} />
                                <FormHelperText>寄付先に関連するURLを入力してください</FormHelperText>
                            </FormControl>
                            <Box marginBottom={6}>
                                {RadioGroup}
                                <FormControl
                                    id="amount"
                                    isRequired={type === "checked"}
                                    isDisabled={type === "checking"}
                                    paddingY={2}
                                    borderLeft="1px"
                                    borderColor="gray.200"
                                    borderRadius={12}
                                    paddingLeft={4}
                                >
                                    <FormLabel>寄付額</FormLabel>
                                    <Flex>
                                        <Tooltip label={formattedAmount} fontSize="md">
                                            <NumberInput
                                                value={amount}
                                                max={100000000000}
                                                min={1}
                                                onChange={handlers.updateAmount}
                                                flex="1"
                                            >
                                                <NumberInputField />
                                            </NumberInput>
                                        </Tooltip>
                                        <Tooltip
                                            label="通貨コードはISO 4217に基づきます。日本円はJPYです"
                                            fontSize="md"
                                        >
                                            <Select value={currency} width={"6em"} onChange={handlers.updateCurrency}>
                                                {CURRENCY_CODES.map((currencyCode, index) => {
                                                    return (
                                                        <option key={currencyCode + index} value={currencyCode}>
                                                            {currencyCode}
                                                        </option>
                                                    );
                                                })}
                                            </Select>
                                        </Tooltip>
                                    </Flex>
                                    <FormHelperText>寄付済みの場合は寄付した金額を入力してください</FormHelperText>
                                </FormControl>
                            </Box>
                            <FormControl id="memo" paddingBottom={6}>
                                <FormLabel>Why?</FormLabel>
                                <FormHelperText>なぜ寄付するのかをメモできます(Markdown形式)</FormHelperText>
                                <Textarea height={"10em"} value={memo} onChange={handlers.updateMemo} />
                            </FormControl>
                            <Button
                                mt={4}
                                colorScheme="teal"
                                isLoading={false}
                                type="submit"
                                disabled={!valid || isSubmitting}
                                onClick={handlers.submit}
                            >
                                Submit
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
