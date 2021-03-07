import React from "react";
import {
    Box,
    Center,
    chakra,
    Container,
    Flex,
    Icon,
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    useColorModeValue
} from "@chakra-ui/react";
import { BiDonateHeart } from "react-icons/bi";
import NextLink from "next/link";

export const OGPTemplate = (props: { used: string; budget: string; balance: string; userName: string }) => {
    return (
        <Container padding={12} border="1px" borderColor="gray.200" borderRadius={8} id={"main"}>
            <Flex align="center">
                <NextLink href="/" passHref>
                    <chakra.a display="block" aria-label="philan.net">
                        philan.net
                    </chakra.a>
                </NextLink>
            </Flex>
            <Box textAlign={"center"}>
                <chakra.h1
                    textAlign={"center"}
                    maxW="16ch"
                    mx="auto"
                    fontSize={{ base: "2.25rem", sm: "3rem", lg: "4rem" }}
                    fontFamily="heading"
                    letterSpacing="tighter"
                    fontWeight="extrabold"
                    marginBottom="16px"
                    lineHeight="1.2"
                >
                    <Center as="span" paddingLeft={"-1em"} color={useColorModeValue("teal.500", "teal.300")}>
                        <Icon as={BiDonateHeart} />
                        {props.userName}
                    </Center>
                </chakra.h1>
            </Box>

            <StatGroup padding={2} border="1px" borderColor="gray.200" borderRadius={12}>
                <Stat>
                    <StatLabel>Budget</StatLabel>
                    <StatNumber>{props.budget}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Used</StatLabel>
                    <StatNumber>{props.used}</StatNumber>
                </Stat>

                <Stat>
                    <StatLabel>Balance</StatLabel>
                    <StatNumber>{props.balance}</StatNumber>
                </Stat>
            </StatGroup>
        </Container>
    );
};
