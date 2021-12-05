import {
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    FormLabel,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Skeleton,
    Stack,
    Stat,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    Table,
    TableCaption,
    Tbody,
    Td,
    Th,
    Thead,
    Tooltip,
    Tr,
    UseCounterProps
} from "@chakra-ui/react";
import Head from "next/head";
import { Footer } from "../../../components/Footer";
import { AddBudgetRequest, BudgetItem } from "../../api/spreadsheet/budget/api-types";
import React, { FC, MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Header } from "../../../components/Header";
import { useLoginUser } from "../../../components/useLoginUser";

type BudgetTableProps = {
    items: BudgetItem[];
};
const BudgetTable: FC<BudgetTableProps> = (props) => {
    return (
        <Table variant="simple">
            <TableCaption placement={"top"}>予算一覧</TableCaption>
            <Thead>
                <Tr>
                    <Th>Year</Th>
                    <Th>Budget</Th>
                    <Th>Used</Th>
                    <Th>Balance</Th>
                </Tr>
            </Thead>
            <Tbody>
                {props.items.map((item) => {
                    return (
                        <Tr key={item.year}>
                            <Td>{item.year}</Td>
                            <Td>{item.budget.value}</Td>
                            <Td>{item.used.value}</Td>
                            <Td>{item.balance.value}</Td>
                        </Tr>
                    );
                })}
            </Tbody>
        </Table>
    );
};

type SubmittingState = "none" | "submitting" | "success" | Error;
const useBudgetInputForm = ({ year, reloadBudgetItems }: { year: number; reloadBudgetItems: () => void }) => {
    const [inputBudget, setInputBudget] = useState(10 * 1000);
    const [submitting, setSubmitting] = useState<SubmittingState>("none");
    const updateBudget: BudgetInputFormProps["updateBudget"] = useCallback(
        (_valueAsString: string, valueAsNumber: number) => {
            if (Number.isNaN(valueAsNumber)) {
                return setInputBudget(0);
            }
            setInputBudget(valueAsNumber);
        },
        []
    );
    const submitBudget: BudgetInputFormProps["submitBudget"] = useCallback(async () => {
        setSubmitting("submitting");
        const body: AddBudgetRequest = {
            budget: inputBudget,
            year
        };
        fetch("/api/spreadsheet/budget/add", {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
            .then((res) => {
                if (res.ok) {
                    setSubmitting("success");
                }
                return res.text().then((text) => Promise.reject(new Error(text)));
            })
            .catch((error) => {
                setSubmitting(error);
            })
            .finally(() => {
                return reloadBudgetItems();
            });
    }, [inputBudget, reloadBudgetItems, year]);
    return [
        { inputBudget, submitting },
        { updateBudget, submitBudget }
    ] as const;
};
type BudgetInputFormProps = {
    year: number;
    budget: number;
    currency: string;
    submitting: SubmittingState;
    updateBudget: UseCounterProps["onChange"];
    submitBudget: MouseEventHandler<HTMLButtonElement>;
};
const BudgetInputForm: FC<BudgetInputFormProps> = (props) => {
    const formattedAmount = useMemo(() => {
        return new Intl.NumberFormat(new Intl.NumberFormat().resolvedOptions().locale, {
            style: "currency",
            currency: props.currency
        }).format(props.budget);
    }, [props.budget, props.currency]);
    return (
        <FormControl id="amount" isRequired>
            <FormLabel>{props.year}年の寄付の予算</FormLabel>
            <Tooltip label={formattedAmount} fontSize="md">
                <NumberInput value={props.budget} max={100000000000} min={100} onChange={props.updateBudget}>
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </Tooltip>
            <FormHelperText>
                {props.year}年の寄付の予算額を入力してください。
                <br />
                年収の１〜２%程度を一つの目安にしてみてください。（後から変更できます）
            </FormHelperText>
            <Button
                mt={4}
                colorScheme="teal"
                isLoading={false}
                type="submit"
                disabled={props.submitting !== "none"}
                onClick={props.submitBudget}
            >
                Submit
            </Button>
        </FormControl>
    );
};
type BudgetDisplay = {
    currentBudgetItem: BudgetItem;
};
const BudgetDisplay: FC<BudgetDisplay> = (props) => {
    return (
        <StatGroup padding={2} border="1px" borderColor="gray.200" borderRadius={12}>
            <Stat>
                <StatLabel>{props.currentBudgetItem.year}年の予算</StatLabel>
                <StatNumber>{props.currentBudgetItem.budget.value}</StatNumber>
                <StatHelpText>予算の値を編集するにはSpreadSheetのBudgetsシートを参照してください</StatHelpText>
            </Stat>
        </StatGroup>
    );
};
const useBudget = () => {
    const [loading, setLoading] = useState<"loading" | "complete" | Error>("loading");
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const query = useRouter().query as BudgetIndexURLQuery;
    const currentYear = useMemo(() => {
        if (query?.year) {
            const parsedYear = Number.parseInt(query?.year, 10);
            if (!Number.isNaN(parsedYear)) {
                return parsedYear;
            }
        }
        return new Date().getFullYear();
    }, [query]);
    const currentBudget = useMemo(() => {
        return budgetItems.find((budgetItem) => budgetItem.year === currentYear);
    }, [budgetItems, currentYear]);
    const reloadBudgetItems = useCallback(() => {
        async function fetchBudgetItems() {
            const budgetItems = await fetch("/api/spreadsheet/budget/get").then((res) => res.json());
            setBudgetItems(budgetItems);
        }

        fetchBudgetItems()
            .then(() => setLoading("complete"))
            .catch((error) => {
                setLoading(error);
            });
    }, []);
    useEffect(() => {
        reloadBudgetItems();
    }, [reloadBudgetItems]);
    return [{ budgetItems, loading, currentBudget, currentYear }, { reloadBudgetItems }] as const;
};
export type BudgetIndexURLQuery = {
    year?: string;
};
export default function BudgetIndex() {
    const user = useLoginUser();
    const [{ budgetItems, loading, currentBudget, currentYear }, { reloadBudgetItems }] = useBudget();
    const [{ inputBudget, submitting }, { updateBudget, submitBudget }] = useBudgetInputForm({
        year: currentYear,
        reloadBudgetItems
    });
    return (
        <>
            <Head>
                <title>予算 - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Header />
            <Box mb={20}>
                <Box as="section" pt={{ base: "10rem", md: "12rem" }} pb={{ base: "0", md: "1rem" }}>
                    <Container maxW="xl">
                        <Box textAlign="center">
                            {loading === "loading" && (
                                <Stack>
                                    <Skeleton height="20px" />
                                    <Skeleton height="20px" />
                                    <Skeleton height="20px" />
                                </Stack>
                            )}
                            {loading === "complete" &&
                                user &&
                                (currentBudget ? (
                                    <BudgetDisplay currentBudgetItem={currentBudget} />
                                ) : (
                                    <BudgetInputForm
                                        year={currentYear}
                                        budget={inputBudget}
                                        currency={user.defaultCurrency}
                                        updateBudget={updateBudget}
                                        submitBudget={submitBudget}
                                        submitting={submitting}
                                    />
                                ))}
                        </Box>
                        <Box w="100%" p={4}>
                            {loading === "loading" ? <p>Loading…</p> : <BudgetTable items={budgetItems} />}
                            {loading instanceof Error && <p>Fail to load budget: {loading.message}</p>}
                        </Box>
                    </Container>
                </Box>
                <Footer />
            </Box>
        </>
    );
}
