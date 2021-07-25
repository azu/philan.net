import Head from "next/head";
import { Header } from "../../components/Header";
import {
    Box,
    Button,
    chakra,
    Container,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Link,
    NumberInput,
    NumberInputField,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tooltip,
    Tr
} from "@chakra-ui/react";
import cronParser from "cron-parser";
import { Footer } from "../../components/Footer";
import React, { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AddSubscritionRequestBody, SubScriptionGetResponseBody } from "../api/subscription/api-types";
import dayjs from "dayjs";
import { LoginUser, useLoginUser } from "../../components/useLoginUser";
import COUNTRY_CURRENCY from "country-to-currency";
import { useFetch } from "../../components/useFetch";

const CURRENCY_CODES = Object.values(COUNTRY_CURRENCY);
export const useSubscriptionForm = (user: LoginUser | null) => {
    const MONTHLY_CRON = "@monthly";
    const YEARLY_CRON = "@yearly";
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [to, setTo] = useState<string>("");
    const [url, setUrl] = useState<string>("https://");
    const [cronType, setCronType] = useState<"monthly" | "yearly" | "yearly-with-start" | "custom">("monthly");
    const [cron, setCron] = useState<string>(MONTHLY_CRON);
    const nextCronDate = useMemo(() => {
        try {
            const interval = cronParser.parseExpression(cron);
            return interval.next().toDate().toLocaleDateString();
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }, [cron]);
    const readonlyCronInput = useMemo(() => {
        return cronType !== "custom";
    }, [cronType]);
    const [amount, setAmount] = useState<number>(1000);
    const [memo, setMemo] = useState<string>("");
    const [valid, setValid] = useState<boolean>(false);
    const [currency, setCurrencyCode] = useState<string>("JPY");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        const validURL = url.length > 0 ? url.startsWith("http") : true;
        const ok = cron.length > 0 && to.length > 0 && validURL && amount > 0;
        setValid(ok);
    }, [cron, to, url, amount, memo, currency]);
    useEffect(() => {
        if (user) {
            setCurrencyCode(user.defaultCurrency);
        }
    }, [user]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
    const formattedAmount = useMemo(() => {
        return new Intl.NumberFormat(new Intl.NumberFormat().resolvedOptions().locale, {
            style: "currency",
            currency: currency
        }).format(amount);
    }, [amount, currency]);
    const handlers = useMemo(
        () => ({
            updateDate: (event: SyntheticEvent<HTMLInputElement>) => {
                if (event.currentTarget.valueAsDate) {
                    setStartDate(event.currentTarget.valueAsDate);
                }
            },
            updateCronType: (value: "monthly" | "yearly" | "yearly-with-start" | "custom") => {
                if (cronType !== value) {
                    switch (value) {
                        case "monthly":
                            setCron(MONTHLY_CRON);
                            break;
                        case "yearly":
                            setCron(YEARLY_CRON);
                            break;
                        case "yearly-with-start": {
                            const startMonth = dayjs(startDate).format("M");
                            setCron(`0 0 1 ${startMonth} *`);
                            break;
                        }
                    }
                }
                setCronType(value);
            },
            updateCron: (event: SyntheticEvent<HTMLInputElement>) => {
                setCron(event.currentTarget.value);
            },
            updateTo: (event: SyntheticEvent<HTMLInputElement>) => {
                setTo(event.currentTarget.value);
            },
            updateUrl: (event: SyntheticEvent<HTMLInputElement>) => {
                setUrl(event.currentTarget.value);
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
            submit: () => {
                if (!user) {
                    return setSubmitError(new Error("require login"));
                }
                const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan.net";
                const body: AddSubscritionRequestBody = {
                    startDate: dayjs(startDate).format("YYYY-MM-DD"),
                    cron,
                    url,
                    amount: amount,
                    memo,
                    to,
                    currency
                };
                setIsSubmitting(true);
                fetch(HOST + "/api/subscription/spreadsheet/add-subscription", {
                    method: "post",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })
                    .catch((error) => {
                        setSubmitError(error);
                    })
                    .finally(() => {
                        setIsSubmitting(false);
                    });
            }
        }),
        [cronType, startDate, amount, user, cron, url, memo, to, currency]
    );

    return {
        startDate,
        cronType,
        cron,
        nextCronDate,
        readonlyCronInput,
        to,
        url,
        amount,
        formattedAmount,
        memo,
        currency,
        valid,
        isLoading,
        isSubmitting,
        submitError,
        submitSuccess,
        handlers
    };
};

export const SubscriptionForm = (props: { response: SubScriptionGetResponseBody | null }) => {
    const loginUser = useLoginUser();
    const {
        startDate,
        cronType,
        cron,
        nextCronDate,
        readonlyCronInput,
        to,
        url,
        amount,
        formattedAmount,
        memo,
        isSubmitting,
        submitError,
        submitSuccess,
        valid,
        isLoading,
        handlers,
        currency
    } = useSubscriptionForm(loginUser);
    if (!props.response) {
        return <p>Loading...</p>;
    }
    return (
        <Box w="100%" p={4}>
            <Box border={"1px"} borderRadius={"12px"} borderColor={"gray.400"} paddingY={4}>
                <Table size="sm" marginBottom={8}>
                    <Thead>
                        <Tr>
                            <Th>Start Date</Th>
                            <Th>End Date</Th>
                            <Th whiteSpace={"nowrap"}>Cron</Th>
                            <Th>To</Th>
                            <Th>Amount</Th>
                            <Th>Url</Th>
                            <Th>Memo</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {props.response?.items?.map((item, index) => {
                            const isEnded = Boolean(item.endDate);
                            return (
                                <Tr key={item.startDate + item.to + index}>
                                    <Td>{item.startDate}</Td>
                                    <Td>{isEnded ? "✔" : "継続中"}</Td>
                                    <Td whiteSpace={"nowrap"}>{item.cron}</Td>
                                    <Td>{item.to}</Td>
                                    <Td>{item.amount.value}</Td>
                                    <Td>{item.url}</Td>
                                    <Td>{item.memo}</Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>
            <Box>
                <chakra.h2
                    maxW="16ch"
                    mx="auto"
                    fontSize={{ base: "1.5rem", sm: "2rem", lg: "3rem" }}
                    fontFamily="heading"
                >
                    定期寄付を新規登録
                </chakra.h2>
                <FormControl id="start-date" isRequired marginBottom={6}>
                    <FormLabel>開始日:</FormLabel>
                    <Input type="date" value={dayjs(startDate).format("YYYY-MM-DD")} onChange={handlers.updateDate} />
                    <FormHelperText>
                        定期寄付を開始した日を入力してください。
                        定期寄付での記録は、登録後の記録のみをつけるため、開始日は過去の日付でも問題ありません。(過去の記録は自動では追加しません)
                    </FormHelperText>
                </FormControl>
                <FormControl id="cron" isRequired marginBottom={6}>
                    <FormLabel>スケジュール:</FormLabel>
                    <RadioGroup onChange={handlers.updateCronType} value={cronType}>
                        <Stack direction="row">
                            <Radio value="monthly">毎月(毎月の1日)</Radio>
                            <Radio value="yearly">毎年(毎年の1月1日)</Radio>
                            <Radio value="yearly-with-start">毎年(開始日と同じ月)</Radio>
                            <Radio value="custom">カスタム(Cron記法で記述)</Radio>
                        </Stack>
                    </RadioGroup>
                    <Input value={cron} onChange={handlers.updateCron} disabled={readonlyCronInput} />
                    <FormHelperText>次の記録予定日: {nextCronDate} </FormHelperText>
                    <FormHelperText>
                        スケジュールの種類を選択してください。 毎月または毎年から選択できます。 また、カスタムでは
                        <Link href={"https://crontab.guru/examples.html"} isExternal={true}>
                            Cron記法
                        </Link>
                        を使って好きなスケジュールを登録できます。(スケジュールでは、時刻は無視されます。一つスケジュールにおいては最大でも1日1つの記録となります。)
                    </FormHelperText>
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
                    <FormControl
                        id="amount"
                        isRequired={true}
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
                            <Tooltip label="通貨コードはISO 4217に基づきます。日本円はJPYです" fontSize="md">
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
                        <FormHelperText>
                            寄付済みの場合は寄付した金額を入力してください。
                            定期寄付の一回ごとの寄付額の入力してください。
                        </FormHelperText>
                    </FormControl>
                </Box>
                <FormControl id="memo" paddingBottom={6}>
                    <FormLabel>Why?</FormLabel>
                    <FormHelperText>
                        なぜ寄付するのかをメモできます(Markdown形式)。 毎回の寄付の記録のメモ欄に追加されます。
                    </FormHelperText>
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
                    登録
                </Button>
            </Box>
        </Box>
    );
};
const SubscriptionPage = () => {
    const [{ response, error }] = useFetch<SubScriptionGetResponseBody>("/api/subscription/get");
    return (
        <>
            <Head>
                <title>定期寄付の管理 - philan.net</title>
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
                            定期寄付の管理ページ
                        </chakra.h1>
                        <Text maxW="800px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                            定期的に寄付をしている対象を管理します。
                        </Text>
                    </Box>
                    <Container maxW={"container.lg"}>
                        <SubscriptionForm response={response} />
                    </Container>
                </Box>
                <Footer />
            </Box>
        </>
    );
};
export default SubscriptionPage;
