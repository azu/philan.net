import Head from "next/head";
import { Header } from "../../components/Header";
import {
    Box,
    Button,
    chakra,
    Checkbox,
    Container,
    Text,
    Label,
    HStack,
    Alert,
    AlertTitl,
    AlertDescriptione,
    AlertIcon,
    CloseButton,
    AlertDescription,
    AlertTitle,
    Heading,
    Img,
    VStack
} from "@chakra-ui/react";
import { Footer } from "../../components/Footer";
import { useFetch } from "../../components/useFetch";
import { SetupStatusResponseBody, SubScriptionGetResponseBody } from "../api/subscription/api-types";
import React, { FC, useCallback, useEffect, useState } from "react";
import fetch from "node-fetch";

const ErrorBox: FC<{ title: string }> = (props) => {
    return (
        <Alert status="error">
            <AlertIcon />
            <Box flex="1">
                <AlertTitle mr={2}>{props.title}</AlertTitle>
                <AlertDescription>{props.children}</AlertDescription>
            </Box>
        </Alert>
    );
};
type SetupStatus = "no-checked" | "checked" | "loading" | Error;
const useSubscriptionSetup = () => {
    const [steps, setSteps] = useState<{
        step1: SetupStatus; // spreadsheet
        step2: SetupStatus; // appsScript
        step3: SetupStatus; // manual
        step4: SetupStatus;
    }>({
        step1: "no-checked",
        step2: "no-checked",
        step3: "no-checked",
        step4: "no-checked"
    });
    useEffect(() => {
        (async function main() {
            const url = new URL(location.href);
            const forceMode = url.searchParams.has("force");
            if (forceMode) {
                return; // start step 1
            }
            const status: SetupStatusResponseBody = await fetch("/api/subscription/setup-status").then((res) =>
                res.json()
            );
            setSteps((prevState) => ({
                ...prevState,
                step1: status.hasSubscriptionSheet ? "checked" : prevState.step1,
                step2: status.hasAppsScript ? "checked" : prevState.step2
            }));
        })();
    }, []);
    const handleStep1 = useCallback(async () => {
        try {
            setSteps((prevState) => ({
                ...prevState,
                step1: "loading"
            }));
            const res = await fetch("/api/subscription/spreadsheet/create", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            }).then((res) => res.json());
            if (!res.ok) {
                throw new Error(res.message);
            }
            setSteps((prevState) => ({
                ...prevState,
                step1: "checked"
            }));
        } catch (error) {
            setSteps((prevState) => ({
                ...prevState,
                step1: error
            }));
        }
    }, []);
    const handleStep2 = useCallback(async () => {
        try {
            const url = new URL(location.href);
            const forceMode = url.searchParams.has("force");

            setSteps((prevState) => ({
                ...prevState,
                step2: "loading"
            }));
            const res = await fetch("/api/subscription/appsScript/create", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    force: forceMode
                })
            }).then((res) => res.json());
            if (!res.ok) {
                throw new Error(res.message);
            }
            setSteps((prevState) => ({
                ...prevState,
                step2: "checked"
            }));
        } catch (error) {
            setSteps((prevState) => ({
                ...prevState,
                step2: error
            }));
        }
    }, []);
    const handleStep3 = useCallback(async () => {
        window.open("/api/spreadsheet/redirect-spreadsheet", "_blank");
        setSteps((prevState) => ({
            ...prevState,
            step3: "checked"
        }));
    }, []);
    const handleStep4 = useCallback(async () => {
        location.href = "/philan/subscription";
        setSteps((prevState) => ({
            ...prevState,
            step4: "checked"
        }));
    }, []);
    return [{ steps }, { handleStep1, handleStep2, handleStep3, handleStep4 }] as const;
};
const SubscriptionSetup = () => {
    const [{ steps }, { handleStep1, handleStep2, handleStep3, handleStep4 }] = useSubscriptionSetup();
    return (
        <Box>
            <Box spacing={4} align="stretch" padding={4} borderWidth="1px" backgroundColor={"gray.100"}>
                <Text>
                    定期寄付の記録するためのセットアップ手順です。
                    順番に実行していき、すべてチェックできたら定期寄付の管理が開始できます。
                </Text>
            </Box>
            <Box>
                <Box padding={4} shadow="md" borderWidth="1px">
                    <VStack spacing={4} align="stretch">
                        <Heading fontSize={"xl"}>
                            1. SpreadSheetに<b>Subscription</b>シートを追加
                        </Heading>
                        <Text>
                            SpreadSheetにSubscriptionシートを追加し、定期寄付を管理するためのシートを追加します。
                        </Text>
                        <Button
                            isLoading={steps.step1 === "loading"}
                            loadingText="追加中"
                            colorScheme="teal"
                            variant="outline"
                            disabled={steps.step1 === "checked"}
                            erro
                            onClick={handleStep1}
                        >
                            Subscriptionシートを追加する
                        </Button>
                    </VStack>
                </Box>
                {steps.step1 instanceof Error && <ErrorBox title={steps.step1.message}>メッセージ</ErrorBox>}
            </Box>
            {steps.step1 === "checked" && (
                <Box>
                    <Box padding={4} shadow="md" borderWidth="1px">
                        <VStack spacing={4} align="stretch">
                            <Heading fontSize={"xl"}>2. SpreadSheetにGoogle Apps Scriptをインストール</Heading>
                            <Text>
                                Google Apps Scriptをインストールし、SpreadSheetに紐付けます。 Google Apps
                                Scriptが定期的な記録の追加をします。
                            </Text>
                            <Button
                                isLoading={steps.step2 === "loading"}
                                loadingText="追加中"
                                colorScheme="teal"
                                variant="outline"
                                disabled={steps.step2 === "checked"}
                                erro
                                onClick={handleStep2}
                            >
                                Apps Scriptをインストールする
                            </Button>
                        </VStack>
                    </Box>
                    {steps.step2 instanceof Error && (
                        <ErrorBox title={steps.step2.message}>
                            Google Apps Scriptのインストールに失敗しました。
                            すでにインストール済みかタイムアウトで失敗した可能性があります。
                        </ErrorBox>
                    )}
                </Box>
            )}
            {steps.step2 === "checked" && (
                <Box>
                    <Box padding={4} shadow="md" borderWidth="1px">
                        <VStack spacing={4} align="stretch">
                            <Heading fontSize={"xl"}>3. Google App Scriptsのセットアップをする</Heading>
                            <Text>
                                SpreadSheetのメニューから <i>philan.net</i> → <i>Set Trigger</i>{" "}
                                を実行して、スケジュールの処理を動かしてください。 初回のみ、Google App
                                Scriptsを動かすために手動で<i>SetTrigger</i>を実行する必要があります。
                            </Text>
                            <Img
                                src={"/guide/subscription-setup-step3.png"}
                                alt={"SpreadSheetメニューからphilan.net → Set Triggerを選択"}
                            />
                            <Button
                                isLoading={steps.step3 === "loading"}
                                loadingText=""
                                colorScheme="teal"
                                variant="outline"
                                disabled={steps.step3 === "checked"}
                                erro
                                onClick={handleStep3}
                                marginY={4}
                            >
                                Spreadsheetを開く
                            </Button>
                        </VStack>
                    </Box>
                </Box>
            )}
            {steps.step3 === "checked" && (
                <Box>
                    <Box padding={4} shadow="md" borderWidth="1px">
                        <VStack spacing={4} align="stretch">
                            <Heading fontSize={"xl"}>4. 定期寄付の対象を登録する</Heading>
                            <Alert status="success">
                                <AlertIcon />
                                これで定期寄付のセットアップは完了です！
                            </Alert>
                            <Text maxW="800px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                                最後に、定期寄付の対象を登録してください。
                            </Text>
                            <Button
                                isLoading={steps.step4 === "loading"}
                                loadingText=""
                                colorScheme="teal"
                                variant="outline"
                                disabled={steps.step4 === "checked"}
                                erro
                                onClick={handleStep4}
                                marginY={4}
                            >
                                定期寄付の対象を登録する
                            </Button>
                        </VStack>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
const SubscriptionPage = () => {
    const [{ response, error }] = useFetch<SubScriptionGetResponseBody>("/api/subscription/get");
    return (
        <>
            <Head>
                <title>定期寄付のセットアップ - philan.net</title>
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
                            定期寄付の開始ページ
                        </chakra.h1>
                        <Text maxW="800px" mx="auto" opacity={0.7} fontSize={{ base: "lg", lg: "xl" }} mt="6">
                            定期寄付の自動管理を開始するには、最初SpreadSheetに定期寄付用のシートとGoogle
                            AppsScriptのインストールを行います。
                        </Text>
                    </Box>
                    <Container maxW={"container.lg"}>
                        <SubscriptionSetup />
                    </Container>
                </Box>
                <Footer />
            </Box>
        </>
    );
};
export default SubscriptionPage;
