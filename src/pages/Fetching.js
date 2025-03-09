import { Spinner, Flex, Text, useToast } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';

function Fetching() {
    const location = useLocation();
    const { students, classes, username, password } = location.state || {};
    const [hasRun, setHasRun] = useState(false);
    const navigate = useNavigate();   
    const toast = useToast();
    useEffect(() => {
        if (!hasRun) {
            const generateClassList = async () => {
                setHasRun(true);

        try {
          // Step 1: Start the server
          const startServer = await fetch('https://e6femuacp8.execute-api.us-east-1.amazonaws.com/StartStudentInfoInstance', {
            method: 'GET',
          });

          if (!startServer.ok) {
            const errorMessage = await startServer.text();
            toast({
              title: 'Error',
              description: errorMessage,
              status: 'error',
              duration: 2500,
              isClosable: true,
            });
            setTimeout(() => navigate('/'), 10000);
            return; // Stop further execution
          }

          // Step 2: Fetch student data
          const response = await fetch('https://54.161.75.178:3000/fetch_students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ students, username, password }),
          });

          if (response.status === 200) {
            const studentInfoList = await response.json();
            console.log(studentInfoList);
            navigate('/table', { state: { classes, studentInfoList } });
          } else if (response.status === 500) {
            const errorMessage = await response.text();
            toast({
              title: 'Error',
              description: errorMessage,
              status: 'error',
              duration: 2500,
              isClosable: true,
            });
            setTimeout(() => navigate('/'), 10000);
          }

          // Step 3: Stop the server
          const stopServer = await fetch('https://by12xxb7o5.execute-api.us-east-1.amazonaws.com/StopStudentInfoInstance', {
            method: 'GET',
          });

          if (!stopServer.ok) {
            const errorMessage = await stopServer.text();
            toast({
              title: 'Error',
              description: errorMessage,
              status: 'error',
              duration: 2500,
              isClosable: true,
            });
            setTimeout(() => navigate('/'), 10000);
          }
        } catch (error) {
          console.error('Fetch Error:', error);
          toast({
            title: 'Network Error',
            description: 'Failed to connect to the server. Please try again later.',
            status: 'error',
            duration: 2500,
            isClosable: true,
          });
          setTimeout(() => navigate('/'), 10000);
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
