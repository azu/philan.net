import { Box, ChakraProvider, Container, Flex, Heading, List, ListIcon, ListItem, Spacer } from "@chakra-ui/react"
import { CheckCircleIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Link } from "@chakra-ui/react"
import dayjs from "dayjs"
import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatGroup,
    Text
} from "@chakra-ui/react"
import React from "react";
import type { GetResponseBody } from "../api/spreadsheet/api-types";

function User({ response }: { response: GetResponseBody }) {
    console.log("response", response);
    return <ChakraProvider>
        <Container maxW="xl">
            <Box padding={"2"}>
                {response.map(item => {
                    return <div key={item.year}>
                        <Box maxW="32rem" padding={2}>
                            <Heading as={"h2"} size={"2xl"}>{item.year}年</Heading>
                        </Box>
                        <StatGroup padding={2} border="1px" borderColor="gray.200" borderRadius={12}>
                            <Stat>
                                <StatLabel>予算</StatLabel>
                                <StatNumber>{item.stats.budge.value}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>使用額</StatLabel>
                                <StatNumber>{item.stats.used.value}</StatNumber>
                                <StatHelpText>
                                    {item.stats.used.raw / item.stats.budge.raw}%
                                </StatHelpText>
                            </Stat>

                            <Stat>
                                <StatLabel>残高</StatLabel>
                                <StatNumber>{item.stats.balance.value}</StatNumber>
                                <StatHelpText>
                                    {100 - (item.stats.used.raw / item.stats.budge.raw)}%
                                </StatHelpText>
                            </Stat>
                        </StatGroup>
                        <List>
                            {item.items.slice().sort((a, b) => {
                                return dayjs(a.date).isBefore(b.date) ? 1 : -1
                            }).map((item) => {
                                return <ListItem
                                    key={item.date}

                                >
                                    <Flex alignItems={"baseline"}>
                                        <Box padding="2">
                                            <ListIcon as={CheckCircleIcon}
                                                      color="green.500"/>
                                            <Link href={item.url} borderBottom={"1px"}
                                                  borderColor={"blue.200"}
                                                  isExternal={true}
                                            >{item.to}</Link>: {item.amount.value}
                                            <ListIcon as={ChevronUpIcon}
                                                      color="green.500"/>
                                        </Box>
                                        <Spacer/>
                                        <Box fontSize={"small"} textAlign={"left"}>
                                            <time dateTime={item.date}>{dayjs(item.date).format("YYYY-MM-DD")}</time>
                                        </Box>
                                    </Flex>
                                    <Text color="gray.600">{item.memo}</Text>
                                </ListItem>
                            })}
                        </List>
                    </div>
                })}
            </Box>
        </Container>
    </ChakraProvider>
}

export async function getStaticPaths() {
    return { paths: [], fallback: "blocking" }
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps({ params }: { params: { slug: [string, string] } }) {
    const [id, token] = params.slug;
    console.log(params);
    const param = new URLSearchParams([
        ["token", token],
        ["spreadsheetId", id]
    ]);
    const res = await fetch('http://localhost:3000/api/spreadsheet/get?' + param, {
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const response = await res.json()

    return {
        props: {
            response,
        },
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 1, // In seconds
    }
}

export default User;
