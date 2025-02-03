import {Box, Button, Image, Text, Flex, Input, Menu,
    MenuList, MenuItem} from '@chakra-ui/react'
import {useNavigate} from 'react-router-dom';
import {useRef, useState} from 'react';
import { ChevronDownIcon } from "@chakra-ui/icons";
//import electricalEngineeringClasses from '../classLists/CS_2022-2026'
import electricalEngineeringClasses from '../classLists/EE_2022-2026'


function Home(){
    const [classes, setClasses] = useState(electricalEngineeringClasses)
    const [classType, setClassType] = useState("Major")
    const [newClass, setNewClass] = useState("")
    const [selectedClasses, setSelectedClasses] = useState([])
    const [students, setStudents] = useState('')
    const secondBoxRef = useRef(null);
    const thirdBoxRef = useRef(null)
    const navigate = useNavigate();

    const handleScroll = (box) => {
        box.current?.scrollIntoView({behavior: 'smooth'})
    }

    const toggleCourse = (course) => {
        setSelectedClasses((prevSelection) => 
            prevSelection.includes(course) 
            ? prevSelection.filter((course2) => course !== course2)
            : [...prevSelection, course])
    }

    const addCourse = (course, type) => {
        if(course !== ""){
            setClasses((prevClasses) => {
                const updatedCourses = {
                    ...prevClasses,
                    [type === "Major" ? "majorCourses" : "supportCourses"]: [
                        ...prevClasses[type === "Major" ? "majorCourses" : "supportCourses"],
                        course,
                    ],
                };
                return updatedCourses;
            });
        }
    }

    const deleteCourse = () => {
        setClasses((prevClasses) => {
            return {
                majorCourses: prevClasses.majorCourses.filter(
                    (course) => !selectedClasses.includes(course)
                ),
                supportCourses: prevClasses.supportCourses.filter(
                    (course) => !selectedClasses.includes(course)
                ),
            };
        });
        setSelectedClasses([])
    };


    return (
        <Box>
            <Box position='relative' w='100vw' h='100vh'>
                <Image src='/calpoly.png' p='30px' borderRadius='50px' w='100%' h='100vh' fit='cover' zIndex="0" filter='brightness(0.5)' />
                <Box position='absolute' top='50%' left='50%' transform='translate(-50%,-50%)'>
                    <Text textColor='white' fontSize='7vh' zIndex="1"  fontFamily='Inter' 
                    fontWeight='bold'>
                        Student Information <br/> Web Scraper
                    </Text>
                    <Button  bg='green' borderRadius='50px' textColor='white' m='40px'
                    padding='25px' boxShadow="0 0px 7px rgba(255, 255, 255, 0.7)" zIndex="2"
                    _hover={{backgroundColor:'#489464'}} onClick={() => handleScroll(secondBoxRef)}>
                        Get Started →
                    </Button>
                </Box>
            </Box>
            <Box w='100vw' h='100vh' ref={secondBoxRef} p='30px'>
                <Flex borderRadius='50px'  w='100%' h='100%' bg='#EDECE9' flexDir='column' p='100px' gap='20px' overflow='scroll'>
                    <Text fontFamily='Inter' fontWeight='bold' fontSize='3vh'>Add Classes</Text>
                    <Flex w='750px' flexDir='row' gap='30px'>
                        <Flex w='400px' flexDir='column' gap='5px'>
                            <Text ml='15px' fontWeight='bold' color='#888888' fontSize='14px'>class/class grouping</Text>
                            <Input w='100%' h='40px' borderRadius='25px' bg='#F9F9F9' boxShadow="0px 0px 7px rgba(0, 0, 0, 0.1)"
                            value={newClass} onChange={(event) => setNewClass(event.target.value)}></Input>
                        </Flex>
                        <Flex w='250px' flexDir='column' gap='5px'>
                            <Text ml='15px' fontWeight='bold' color='#888888' fontSize='14px'>type</Text>
                            <Menu>
                                <Button w='100%' h='40px' borderRadius='25px' bg='#F9F9F9'
                                boxShadow="0px 0px 7px rgba(0, 0, 0, 0.1)" rightIcon={<ChevronDownIcon/>}
                                textAlign='left' color='#B6B6B6'>   
                                    {classType}  
                                </Button>
                                <MenuList>
                                    <MenuItem onClick={() => setClassType('Major')}>Major</MenuItem>
                                    <MenuItem onClick={() => setClassType('Support')}>Support</MenuItem>
                                </MenuList>
                            </Menu>
                        </Flex>
                    </Flex>
                    <Flex flexDirection='row' gap='20px'>
                        <Button w='100px' borderRadius='20px' bg='#507762' color='white' 
                        boxShadow="0px 0px 5px rgba(0, 0, 0, 0.4)" onClick={() => {addCourse(newClass, classType)}}>Add</Button>
                        <Button w='100px' borderRadius='20px' bg='#99393B' color='white' 
                        boxShadow="0px 0px 5px rgba(0, 0, 0, 0.4)" onClick={deleteCourse}>Delete</Button>
                    </Flex>
                    <Text fontWeight='bold' fontSize='2.5vh' color='#6B6B6B'>Major Classes</Text>
                    <Flex w='100%' gap='10px' wrap='wrap'>
                        {
                            classes.majorCourses.map((majorCourse) => {
                                return(
                                <Box p='5px 20px 5px 20px' bg={selectedClasses.includes(majorCourse) ? '#D37171':'#A1B7A9'} 
                                color={selectedClasses.includes(majorCourse) ? '#FFFFFF' :'#515151'} 
                                _hover={{backgroundColor:'#D37171', color:'#FFFFFF'}} 
                                borderRadius='15px' boxShadow="0px 0px 5px rgba(0, 0, 0, 0.4)"
                                onClick={() => toggleCourse(majorCourse)}>
                                    <Text fontWeight='bold'>{majorCourse} </Text>
                                </Box>)
                            })
                        }
                    </Flex>
                    <Text fontWeight='bold' fontSize='2.5vh' color='#6B6B6B'>Support Classes</Text>
                    <Flex w='100%' gap='10px' wrap='wrap'>
                        {
                            classes.supportCourses.map((supportCourse) => {
                                return(
                                <Box p='5px 20px 5px 20px' bg={selectedClasses.includes(supportCourse) ? '#D37171':'#A1B7A9'} 
                                color={selectedClasses.includes(supportCourse) ? '#FFFFFF' :'#515151'} 
                                _hover={{backgroundColor:'#D37171', textColor:'#FFFFFF'}} onClick={() => toggleCourse(supportCourse)} 
                                borderRadius='15px' boxShadow="0px 0px 5px rgba(0, 0, 0, 0.4)">
                                    <Text fontWeight='bold'>{supportCourse} </Text>
                                </Box>)
                            })
                        }
                    </Flex>
                    <Button  bg='green' w='150px' borderRadius='50px' textColor='white' mt='20px'
                    padding='25px' boxShadow="0 0px 7px rgba(0, 0, 0, 0.7)" zIndex="2"
                    _hover={{backgroundColor:'#489464'}} onClick={() => handleScroll(thirdBoxRef)}>
                        Continue
                    </Button>

                </Flex>

            </Box>
            <Box w='100vw' h='100vh' ref={thirdBoxRef} p='30px'>
                <Flex borderRadius='50px'  w='100%' h='100%' bg='#EDECE9' flexDir='column' p='100px' gap='20px' overflow='scroll'>
                    <Text fontFamily='Inter' fontWeight='bold' fontSize='3vh'>Add Student Emails</Text>
                    <Input w='100%' h='90%' bg='white' value={students} onChange={(event) => setStudents(event.target.value)}/>
                    <Button  bg='green' w='300px' borderRadius='50px' textColor='white' mt='20px'
                    padding='25px' boxShadow="0 0px 7px rgba(0, 0, 0, 0.7)" zIndex="2"
                    _hover={{backgroundColor:'#489464'}} onClick={() => navigate('/fetch', {state: {students: students.split(" ").map(item => item.trim()).filter(item => item !== ''), classes}})}>
                        Fetch Student Information
                    </Button>
                </Flex>
            </Box>
        
        </Box>
    )
}
export default Home;