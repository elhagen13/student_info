import { Spinner, Box, Flex, Text } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

function Fetching() {
    const location = useLocation();
    const { students, classes } = location.state || {};
    const [hasRun, setHasRun] = useState(false);
    const navigate = useNavigate();   
    console.log(students)
    useEffect(() => {
        if (!hasRun) {
            const generateClassList = async () => {
                setHasRun(true); 
                const response = await fetch('http://localhost:3001/fetch_students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({students}),
                });
                if(response.status === 200){
                    navigate('/table', {state: {classes}})
                }
            };

            generateClassList();
        }
    }, [hasRun]); 

    return (
        <Flex
            width="100vw"
            height="100vh"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap="20px"
            bg="#EDECE9"
        >
            <Text fontFamily="Inter" fontWeight="bold" fontSize="40px">
                FETCHING STUDENTS...
            </Text>
            <Spinner boxSize="100px" borderWidth="10px" speed="1s" emptyColor="#B5B4B0" />
        </Flex>
    );
}

export default Fetching;
