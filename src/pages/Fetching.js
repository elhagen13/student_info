import { Spinner, Flex, Text, useToast } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Fetching() {
    const location = useLocation();
    const { students, classes, username, password } = location.state || {};
    const [status, setStatus] = useState('Starting process...');
    const [progress, setProgress] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
      const startProcess = async () => {
          try {
            /*
              // Step 1: Start the server
              setStatus('Starting server instance...');
              const startServer = await fetch('https://e6femuacp8.execute-api.us-east-1.amazonaws.com/StartStudentInfoInstance');
  
              if (!startServer.ok) {
                  throw new Error(await startServer.text());
              }*/
  
              // Step 2: Connect to SSE stream
              setStatus('Connecting to student data stream...');
              const eventSource = new EventSource(`http://54.161.75.178:3000/api/fetch_students?students=${encodeURIComponent(JSON.stringify(students))}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
  
              eventSource.onmessage = (event) => {
                  try {
                      const data = JSON.parse(event.data);
                      
                      if (data.status) {
                          // Handle status updates
                          setStatus(data.status);
                      } else if (data.students) {
                          // Final data received
                          navigate('/table', { state: { classes, studentInfoList: data.students } });
                          eventSource.close();
                      }
                  } catch (e) {
                      console.error('Error parsing event data:', e);
                  }
              };
  
              eventSource.addEventListener('error', (error) => {
                  console.error('EventSource error:', error);
                  toast({
                      title: 'Connection Error',
                      description: 'Failed to maintain connection with server',
                      status: 'error',
                      duration: 5000,
                      isClosable: true,
                  });
                  eventSource.close();
                  navigate('/');
              });
  
              eventSource.addEventListener('complete', () => {
                  eventSource.close();
              });
  
              return () => {
                  eventSource.close();
              };
  
          } catch (error) {
              console.error('Initialization error:', error);
              toast({
                  title: 'Error',
                  description: error.message,
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
              });
              navigate('/');
          }
      };
  
      startProcess();
  }, []);
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
                FETCHING STUDENT DATA
            </Text>
            <Text fontSize="xl" mb={4}>
                {status}
            </Text>
            {progress && (
                <Text fontSize="lg" color="gray.600">
                    Progress: {progress}
                </Text>
            )}
            <Spinner 
                boxSize="100px" 
                borderWidth="10px" 
                speed="1s" 
                emptyColor="#B5B4B0" 
                color="#3182CE" 
                thickness="10px"
            />
        </Flex>
    );
}

export default Fetching;