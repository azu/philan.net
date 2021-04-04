import {
    Img,
    Box,
    BoxProps,
    chakra,
    Flex,
    HStack,
    Icon,
    IconButton,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useColorMode,
    useColorModeValue,
    useDisclosure,
    useUpdateEffect
} from "@chakra-ui/react";
import { useViewportScroll } from "framer-motion";
import NextLink from "next/link";
import React, { useCallback } from "react";
import { FaHeart, FaMoon, FaSun } from "react-icons/fa";
import { RiAddFill } from "react-icons/ri";
import { useLoginUser } from "./useLoginUser";
import Head from "next/head";

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
        aria-label="Support philan.net on GitHub"
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

type HeaderProps = {};

const Logo = () => {
    const fillColor = useColorModeValue("#2D3748", "#fff");
    return (
        <svg width="auto" height="80" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M49 66C49 59.3726 54.3726 54 61 54H129C135.627 54 141 59.3726 141 66V134C141 140.627 135.627 146 129 146H61C54.3726 146 49 140.627 49 134V66Z"
                fill="white"
            />
            <rect x="49" y="54" width="92" height="92" fill="#319795" />
            <path
                d="M75.7686 127V122.693L81.3398 121.736V82.5322L75.7686 81.5752V77.2344H98.6348C103.944 77.2344 108.068 78.6016 111.008 81.3359C113.97 84.0703 115.451 87.6706 115.451 92.1367C115.451 96.6484 113.97 100.26 111.008 102.972C108.068 105.683 103.944 107.039 98.6348 107.039H88.0732V121.736L93.6445 122.693V127H75.7686ZM88.0732 101.775H98.6348C102.007 101.775 104.525 100.875 106.188 99.0752C107.875 97.2523 108.718 94.9622 108.718 92.2051C108.718 89.4479 107.875 87.1465 106.188 85.3008C104.525 83.4551 102.007 82.5322 98.6348 82.5322H88.0732V101.775Z"
                fill="white"
            />
            <circle cx="122.5" cy="117.5" r="4.5" fill="white" />
            <path
                d="M132 135C132 137.761 129.761 140 127 140C124.239 140 122 137.761 122 135C122 132.239 124.239 130 127 130C129.761 130 132 132.239 132 135Z"
                fill="white"
            />
            <circle cx="109.5" cy="130.5" r="4.5" fill="white" />
            <path d="M121.779 121.085L119.75 127.202" stroke="white" />
            <path d="M120 127L113.176 129.468" stroke="white" />
            <line x1="119.354" y1="126.646" x2="124.354" y2="131.646" stroke="white" />
            <path
                d="M172.289 136.188V132.467L176.771 131.646V96.8418L171.996 96.0215V92.3008H181.723L182.25 96.168C184.418 93.1992 187.455 91.7148 191.361 91.7148C193.979 91.7148 196.215 92.4277 198.07 93.8535C199.926 95.2598 201.342 97.2422 202.318 99.8008C203.295 102.34 203.783 105.318 203.783 108.736V109.352C203.783 112.398 203.285 115.064 202.289 117.35C201.312 119.635 199.906 121.422 198.07 122.711C196.234 123.98 194.027 124.615 191.449 124.615C187.602 124.615 184.633 123.316 182.543 120.719V131.646L187.582 132.467V136.188H172.289ZM189.662 120.104C192.396 120.104 194.467 119.107 195.873 117.115C197.279 115.123 197.982 112.535 197.982 109.352V108.736C197.982 105.123 197.279 102.164 195.873 99.8594C194.467 97.5547 192.377 96.4023 189.604 96.4023C187.963 96.4023 186.557 96.7734 185.385 97.5156C184.213 98.2578 183.266 99.2734 182.543 100.562V116.002C183.266 117.311 184.203 118.326 185.355 119.049C186.527 119.752 187.963 120.104 189.662 120.104ZM207.24 124V120.309L212.016 119.488V82.8379L207.24 82.0176V78.2969H217.787V96.5195C218.881 94.9961 220.219 93.8145 221.801 92.9746C223.383 92.1348 225.141 91.7148 227.074 91.7148C230.473 91.7148 233.109 92.7305 234.984 94.7617C236.859 96.793 237.797 99.918 237.797 104.137V119.488L242.572 120.309V124H227.25V120.309L232.025 119.488V104.078C232.025 98.9609 229.789 96.4023 225.316 96.4023C223.734 96.4023 222.289 96.7832 220.98 97.5449C219.691 98.2871 218.627 99.3027 217.787 100.592V119.488L222.562 120.309V124H207.24ZM246.322 124V120.309L251.098 119.488V96.8418L246.322 96.0215V92.3008H256.869V119.488L261.645 120.309V124H246.322ZM250.805 84.4785V78.2969H256.869V84.4785H250.805ZM265.336 124V120.309L270.111 119.488V82.8379L265.336 82.0176V78.2969H275.883V119.488L280.658 120.309V124H265.336ZM295.043 124.615C291.742 124.615 289.232 123.814 287.514 122.213C285.795 120.592 284.936 118.316 284.936 115.387C284.936 112.379 286.166 109.967 288.627 108.15C291.088 106.314 294.506 105.396 298.881 105.396H304.535V102.291C304.535 100.377 303.949 98.8926 302.777 97.8379C301.625 96.7832 299.994 96.2559 297.885 96.2559C296.557 96.2559 295.404 96.4219 294.428 96.7539C293.451 97.0664 292.562 97.5059 291.762 98.0723L291.146 102.496H286.693V95.2305C289.564 92.8867 293.324 91.7148 297.973 91.7148C301.82 91.7148 304.838 92.6328 307.025 94.4688C309.213 96.3047 310.307 98.9316 310.307 102.35V117.613C310.307 118.023 310.307 118.424 310.307 118.814C310.326 119.205 310.355 119.596 310.395 119.986L313.471 120.309V124H305.18C304.848 122.398 304.643 120.943 304.564 119.635C303.451 121.061 302.055 122.252 300.375 123.209C298.715 124.146 296.938 124.615 295.043 124.615ZM295.893 119.781C297.807 119.781 299.555 119.322 301.137 118.404C302.719 117.486 303.852 116.383 304.535 115.094V109.352H298.676C296.02 109.352 294.027 109.986 292.699 111.256C291.371 112.525 290.707 113.941 290.707 115.504C290.707 118.355 292.436 119.781 295.893 119.781ZM317.953 124V120.309L322.729 119.488V96.8418L317.953 96.0215V92.3008H327.885L328.295 97.0176C329.35 95.3379 330.668 94.0391 332.25 93.1211C333.852 92.1836 335.668 91.7148 337.699 91.7148C341.117 91.7148 343.764 92.7207 345.639 94.7324C347.514 96.7246 348.451 99.8105 348.451 103.99V119.488L353.227 120.309V124H337.904V120.309L342.68 119.488V104.107C342.68 101.314 342.123 99.332 341.01 98.1602C339.916 96.9883 338.236 96.4023 335.971 96.4023C334.311 96.4023 332.836 96.8027 331.547 97.6035C330.277 98.4043 329.262 99.498 328.5 100.885V119.488L333.275 120.309V124H317.953ZM359.408 124V118.082H365.18V124H359.408ZM371.801 124V120.309L376.576 119.488V96.8418L371.801 96.0215V92.3008H381.732L382.143 97.0176C383.197 95.3379 384.516 94.0391 386.098 93.1211C387.699 92.1836 389.516 91.7148 391.547 91.7148C394.965 91.7148 397.611 92.7207 399.486 94.7324C401.361 96.7246 402.299 99.8105 402.299 103.99V119.488L407.074 120.309V124H391.752V120.309L396.527 119.488V104.107C396.527 101.314 395.971 99.332 394.857 98.1602C393.764 96.9883 392.084 96.4023 389.818 96.4023C388.158 96.4023 386.684 96.8027 385.395 97.6035C384.125 98.4043 383.109 99.498 382.348 100.885V119.488L387.123 120.309V124H371.801ZM425.15 124.615C422.221 124.615 419.672 123.951 417.504 122.623C415.336 121.275 413.656 119.41 412.465 117.027C411.293 114.645 410.707 111.891 410.707 108.766V107.477C410.707 104.469 411.322 101.783 412.553 99.4199C413.803 97.0371 415.453 95.1621 417.504 93.7949C419.574 92.4082 421.83 91.7148 424.271 91.7148C428.529 91.7148 431.752 93.0039 433.939 95.582C436.146 98.1602 437.25 101.598 437.25 105.895V109.498H416.684L416.596 109.645C416.654 112.691 417.426 115.201 418.91 117.174C420.395 119.127 422.475 120.104 425.15 120.104C427.104 120.104 428.812 119.83 430.277 119.283C431.762 118.717 433.041 117.945 434.115 116.969L436.371 120.719C435.238 121.812 433.734 122.74 431.859 123.502C430.004 124.244 427.768 124.615 425.15 124.615ZM416.859 104.986H431.479V104.225C431.479 101.959 430.873 100.064 429.662 98.541C428.451 97.0176 426.654 96.2559 424.271 96.2559C422.338 96.2559 420.688 97.0762 419.32 98.7168C417.953 100.338 417.113 102.379 416.801 104.84L416.859 104.986ZM452.953 124.498C450.609 124.498 448.744 123.814 447.357 122.447C445.99 121.061 445.307 118.854 445.307 115.826V96.5781H440.297V92.3008H445.307V84.6543H451.078V92.3008H457.963V96.5781H451.078V115.826C451.078 117.35 451.381 118.473 451.986 119.195C452.592 119.918 453.402 120.279 454.418 120.279C455.102 120.279 455.863 120.221 456.703 120.104C457.543 119.967 458.197 119.85 458.666 119.752L459.457 123.531C458.617 123.785 457.582 124.01 456.352 124.205C455.141 124.4 454.008 124.498 452.953 124.498Z"
                fill={fillColor}
            />
        </svg>
    );
};

function HeaderContent() {
    const mobileNav = useDisclosure();
    const { toggleColorMode: toggleMode } = useColorMode();
    const text = useColorModeValue("dark", "light");
    const SwitchIcon = useColorModeValue(FaMoon, FaSun);
    const mobileNavBtnRef = React.useRef<HTMLButtonElement>();
    const user = useLoginUser();
    useUpdateEffect(() => {
        mobileNavBtnRef.current?.focus();
    }, [mobileNav.isOpen]);
    const AddNewRecord = useCallback(() => {
        window.location.href = "/philan/add";
    }, []);
    const Logout = useCallback(() => {
        fetch("/api/auth/logout", {
            method: "post"
        })
            .catch((error) => {
                console.error("Fail to logout", error);
            })
            .finally(() => {
                window.location.href = "/";
            });
    }, []);
    const LogInOut = user ? (
        <Link aria-label={"Logout from philan.net"} onClick={Logout}>
            Logout
        </Link>
    ) : (
        <Link aria-label={"Login with Google"} href={"/api/auth"}>
            Login
        </Link>
    );
    const addNewDonation = user ? (
        <IconButton
            onClick={AddNewRecord}
            variant="outline"
            colorScheme="teal"
            aria-label="Add new donation record"
            icon={<RiAddFill />}
        />
    ) : null;
    const myPageLink = user ? (
        <Menu>
            <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<Img boxSize="32px" borderRadius="full" objectFit="cover" alt={user.name} src={user.avatarUrl} />}
                backgroundColor={"transparent"}
            />
            <MenuList>
                <MenuItem onClick={() => (location.href = `/user/${user.id}`)}>Open My Page</MenuItem>
                <MenuItem onClick={() => window.open(user.spreadsheetUrl, "_blank")}>Open SpreadSheet</MenuItem>
                <MenuItem onClick={() => (location.href = `/philan/edit`)}>Edit Profile</MenuItem>
            </MenuList>
        </Menu>
    ) : null;
    return (
        <>
            <Flex w="100%" h="100%" px="6" align="center" justify="space-between">
                <Flex align="center">
                    <NextLink href="/" passHref>
                        <chakra.a display="block" aria-label="philan.net">
                            <Logo />
                        </chakra.a>
                    </NextLink>
                </Flex>

                <Flex justify="flex-end" w="100%" maxW="824px" align="center" color="gray.400">
                    <HStack paddingRight="5" spacing="5" display={{ base: "flex" }}>
                        {LogInOut}
                        {addNewDonation}
                        {myPageLink}
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

const MaxHeaderHeight = `72px` as const;

export function Header(props: HeaderProps) {
    const bg = useColorModeValue("white", "gray.800");
    const ref = React.useRef<HTMLHeadingElement>(null);
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
            maxHeight={MaxHeaderHeight}
        >
            <Head>
                <style>
                    {`
                    html {
                        /* Header Height */
                        scroll-padding-top: ${MaxHeaderHeight};
                    }
                `}
                </style>
            </Head>
            <chakra.div height="4.5rem" mx="auto" maxW="1200px">
                <HeaderContent {...props} />
            </chakra.div>
        </chakra.header>
    );
}
