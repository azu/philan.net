import {
    chakra,
    Flex,
    BoxProps,
    HStack,
    IconButton,
    Link,
    Box,
    Icon,
    useColorMode,
    useColorModeValue,
    useDisclosure,
    useUpdateEffect
} from "@chakra-ui/react";
import { useViewportScroll } from "framer-motion";
import NextLink from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { RiAddFill } from "react-icons/ri";

const GithubIcon = (props: any) => (
    <svg viewBox="0 0 20 20" {...props}>
        <path
            fill="currentColor"
            d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0"
        />
    </svg>
);

const SponsorButton = (props: BoxProps) => (
    <Box
        display={{ base: "none", md: "flex" }}
        alignItems="center"
        as="a"
        aria-label="Sponsor philan.net on GitHub"
        href={"https://github.com/sponsors/azu"}
        target="_blank"
        rel="noopener noreferrer"
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.200"
        px="1em"
        minH="36px"
        borderRadius="md"
        fontSize="sm"
        color="gray.800"
        outline="0"
        transition="all 0.3s"
        _hover={{
            bg: "gray.100",
            borderColor: "gray.300"
        }}
        _active={{
            borderColor: "gray.200"
        }}
        _focus={{
            boxShadow: "outline"
        }}
        {...props}
    >
        <Icon as={FaHeart} w="4" h="4" color="red.500" mr="2" />
        <Box as="strong" lineHeight="inherit" fontWeight="semibold">
            Sponsor
        </Box>
    </Box>
);

function HeaderContent() {
    const mobileNav = useDisclosure();

    const { toggleColorMode: toggleMode } = useColorMode();
    const text = useColorModeValue("dark", "light");
    const SwitchIcon = useColorModeValue(FaMoon, FaSun);
    const mobileNavBtnRef = React.useRef<HTMLButtonElement>();

    useUpdateEffect(() => {
        mobileNavBtnRef.current?.focus();
    }, [mobileNav.isOpen]);

    const [loginState, setLoginState] = useState<"login" | "loading" | "logout">("loading");
    const AddNewRecord = useCallback(() => {
        window.location.href = "/philan/add";
    }, []);
    const Logout = useCallback(() => {
        fetch("/api/user/logout", {
            method: "post"
        })
            .catch((error) => {
                console.error("Fail to logout", error);
            })
            .finally(() => {
                window.location.href = "/";
            });
    }, []);
    useEffect(() => {
        fetch("/api/auth/get")
            .then((res) => res.json())
            .then((json) => {
                if (json.login) {
                    setLoginState("login");
                } else {
                    setLoginState("logout");
                }
            })
            .catch(() => {
                setLoginState("logout");
            });
    }, []);
    const LogInOut =
        loginState !== "loading" ? (
            loginState === "login" ? (
                <Link aria-label={"Logout from philan.net"} onClick={Logout}>
                    Logout
                </Link>
            ) : (
                <Link aria-label={"Login with Google"} href={"/api/auth"}>
                    Login
                </Link>
            )
        ) : null;
    const addNewDonation =
        loginState !== "loading" ? (
            loginState === "login" ? (
                <IconButton
                    onClick={AddNewRecord}
                    variant="outline"
                    colorScheme="teal"
                    aria-label="Add new donation record"
                    icon={<RiAddFill />}
                />
            ) : null
        ) : null;
    return (
        <>
            <Flex w="100%" h="100%" px="6" align="center" justify="space-between">
                <Flex align="center">
                    <NextLink href="/" passHref>
                        <chakra.a display="block" aria-label="Chakra UI, Back to homepage">
                            philan.net
                        </chakra.a>
                    </NextLink>
                </Flex>

                <Flex justify="flex-end" w="100%" maxW="824px" align="center" color="gray.400">
                    <HStack paddingRight="5" spacing="5" display={{ base: "flex" }}>
                        {LogInOut}
                        {addNewDonation}
                    </HStack>
                    <HStack spacing="5" display={{ base: "none", md: "flex" }}>
                        <Link
                            isExternal
                            aria-label="Go to philan.net GitHub Repository"
                            href={"https://github.com/azu/philan.net"}
                        >
                            <Icon
                                as={GithubIcon}
                                display="block"
                                transition="color 0.2s"
                                w="5"
                                h="5"
                                _hover={{ color: "gray.600" }}
                            />
                        </Link>
                    </HStack>
                    <IconButton
                        size="md"
                        fontSize="lg"
                        aria-label={`Switch to ${text} mode`}
                        variant="ghost"
                        color="current"
                        ml={{ base: "0", md: "3" }}
                        onClick={toggleMode}
                        icon={<SwitchIcon />}
                    />
                    <SponsorButton ml="5" />
                </Flex>
            </Flex>
        </>
    );
}

export function Header(props: any) {
    const bg = useColorModeValue("white", "gray.800");
    const ref = React.useRef<HTMLHeadingElement>();
    const [y, setY] = React.useState(0);
    const { height = 0 } = ref.current?.getBoundingClientRect() ?? {};

    const { scrollY } = useViewportScroll();
    React.useEffect(() => {
        return scrollY.onChange(() => setY(scrollY.get()));
    }, [scrollY]);

    return (
        <chakra.header
            ref={ref}
            shadow={y > height ? "sm" : undefined}
            transition="box-shadow 0.2s"
            pos="fixed"
            top="0"
            zIndex="3"
            bg={bg}
            left="0"
            right="0"
            borderTop="6px solid"
            borderTopColor="teal.400"
            width="full"
            {...props}
        >
            <chakra.div height="4.5rem" mx="auto" maxW="1200px">
                <HeaderContent />
            </chakra.div>
        </chakra.header>
    );
}
