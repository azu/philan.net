import {
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper
} from "@chakra-ui/react";
import React, { SyntheticEvent, useEffect, useMemo, useState } from "react";

function userForm() {
    const [id, setId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [budget, setBudget] = useState<number>(10000);
    const [valid, setValid] = useState<boolean>(false);
    useEffect(() => {
        const ok = id.length > 0 && name.length > 0 && budget > 0;
        setValid(ok);
    }, [id, name, budget]);
    const handlers = useMemo(
        () => ({
            updateId: (event: SyntheticEvent<HTMLInputElement>) => {
                setId(event.currentTarget.value);
            },
            updateName: (event: SyntheticEvent<HTMLInputElement>) => {
                setName(event.currentTarget.value);
            },
            updateBudget: (_valueAsString: string, valueAsNumber: number) => {
                setBudget(valueAsNumber);
            }
        }),
        [id, name, budget]
    );

    return {
        id,
        name,
        budget,
        valid,
        handlers
    };
}

export default function Create() {
    const { id, name, valid, budget, handlers } = userForm();
    const submit = () => {
        const WORKER_API = "http://localhost:8787";
        fetch(WORKER_API + "/worker/user/create", {
            method: "post",
            headers: {
                "content-type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify({
                id,
                name,
                budget
            })
        });
    };
    return (
        <Container maxW="xl">
            <Box w="100%" p={4}>
                <FormControl id="id" isRequired>
                    <FormLabel>Your Id</FormLabel>
                    <Input value={id} onChange={handlers.updateId} />
                    <FormHelperText>Your account id</FormHelperText>
                </FormControl>
                <FormControl id="name" isRequired>
                    <FormLabel>Your Name</FormLabel>
                    <Input value={name} onChange={handlers.updateName} />
                    <FormHelperText>Your display name</FormHelperText>
                </FormControl>
                <FormControl id="amount" isRequired>
                    <FormLabel>Your Budget</FormLabel>
                    <NumberInput value={budget} max={100000000000} min={100} onChange={handlers.updateBudget}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
                <Button mt={4} colorScheme="teal" isLoading={false} type="submit" disabled={!valid} onClick={submit}>
                    Submit
                </Button>
            </Box>
        </Container>
    );
}
