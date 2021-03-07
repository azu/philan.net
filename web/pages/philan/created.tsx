import {
    Avatar,
    Box,
    chakra,
    Container,
    Icon,
    IconButton,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import Head from "next/head";
import { Header } from "../../components/Header";
import { RiAddFill } from "react-icons/ri";
import { useLoginUser } from "../../components/useLoginUser";
import { AiOutlineInfoCircle } from "react-icons/ai";
export default function Created() {
    const user = useLoginUser();
    const AddNewRecord = useCallback(() => {
        window.location.href = "/philan/add";
    }, []);
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
                icon={<Avatar loading="lazy" size="sm" name={user.name} src={user.avatarUrl} />}
                backgroundColor={"transparent"}
            />
            <MenuList>
                <MenuItem onClick={() => (location.href = `/user/${user.id}`)}>Open My Page</MenuItem>
                <MenuItem onClick={() => window.open(user.spreadsheetUrl, "_blank")}>Open SpreadSheet</MenuItem>
            </MenuList>
        </Menu>
    ) : null;
    return (
        <>
            <Head>
                <title>アカウントを作成しました 🎉 - philan.net</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Header />
            <Box mb={20}>
                <Box as="section" pt={{ base: "10rem", md: "12rem" }} pb={{ base: "0", md: "1rem" }}>
                    <Box textAlign="center">
                        <chakra.h1
                            maxW="20ch"
                            mx="auto"
                            fontSize={{ base: "2.25rem", sm: "2rem", lg: "3rem" }}
                            fontFamily="heading"
                            letterSpacing="tighter"
                            fontWeight="extrabold"
                            marginBottom="16px"
                            lineHeight="1.2"
                        >
                            アカウントを作成しました 🎉
                        </chakra.h1>
                    </Box>
                </Box>
                <Container>
                    <Box>ヘッダーの {addNewDonation} ボタンから寄付の記録や検討中の項目を追加できます。</Box>
                    <Box>ヘッダーの {myPageLink} ボタンから寄付の一覧や記録用のSpreadSheetを開けます。</Box>
                </Container>
                <Container>
                    <Box>
                        寄付先を探している人は
                        <Link
                            href={"https://github.com/azu/philan.net/blob/main/docs/ja/knowledge.md"}
                            color="teal.500"
                            isExternal={true}
                        >
                            <Icon as={AiOutlineInfoCircle} fontSize="xl" color="gray.400" />
                            ナレッジベース
                        </Link>
                        を参照してみてください
                    </Box>
                </Container>
            </Box>
        </>
    );
}
