import { Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Text, Checkbox,Select, Button} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import data from '../student_info.json';
import { useLocation } from 'react-router-dom';

function TablePage() {
    const location = useLocation();
    const { classes } = location.state || {};
    const [separatedClasses, setSeparatedClasses] = useState([])
    const [students, setStudents] = useState(data);
    const [options, setOptions] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const items = ["Name", "Email", "Empl ID", "FTF", "Expected Academic Progress (EAP)", "Actual Academic Progress", "Academic Standing", "Estimated Major GPA", "Courses"]
    const limiters = ["First Time Freshmen", "Transfers"]
    const [terms, setTerms] = useState([])
    console.log(classes)
    useEffect(() => {
        const terms = new Set();
        students.forEach(student => {
            Object.keys(student).forEach(key => {
                if (/^\d{4}$/.test(key)){
                    terms.add(key);
                }
            })
        })
        const sortedTerms = [...terms].sort((a, b) => parseInt(a) - parseInt(b));
        setTerms([...sortedTerms])
    }, [students])

    useEffect(() => {
        const courses = new Set();
        if (classes?.majorCourses) {
            classes.majorCourses.forEach(course => {
                const orOpts = course.split(' or ').map(opt => opt.trim());
                orOpts.forEach(opts => {
                    const andOpts = opts.split(' & ').map(opt => opt.trim());
                    andOpts.forEach(opt => courses.add(opt))
                });
            });
        }
        if (classes?.supportCourses) {
            classes.supportCourses.forEach(course => {
                const orOpts = course.split(' or ').map(opt => opt.trim());
                orOpts.forEach(opts => {
                    const andOpts = opts.split(' & ').map(opt => opt.trim());
                    andOpts.forEach(opt => courses.add(opt))
                });
            });
        }
        setSeparatedClasses([...courses])
    }, [classes]);

    const updateFilters = () => {
        if (sortOption === "Estimated Major GPA") {
            const sortedStudents = [...students].sort((a, b) => {
                const aGPA = parseFloat(a["Estimated Major GPA"]);
                const bGPA = parseFloat(b["Estimated Major GPA"]);
                return sortOrder === "Ascending" ? aGPA - bGPA : bGPA - aGPA;
            });
            setStudents(sortedStudents);
        }
        else if(sortOption === "EAP - AAP"){
            const sortedStudents = [...students].sort((a, b) => {
                const aDiff = parseFloat(a["Expected Academic Progress (EAP)"] - a["Actual Academic Progress"]);
                const bDiff = parseFloat(b["Expected Academic Progress (EAP)"] - b["Actual Academic Progress"]);
                return sortOrder === "Ascending" ? aDiff - bDiff : bDiff - aDiff;
            });
            setStudents(sortedStudents);
        }
    }

    return (
        <Box overflowX="auto" p='20px'> 
            <Box m='20px'>
                <Text textStyle="sm" fontWeight="medium">
                    Select Columns
                </Text>
                <Flex columnGap="10" wrap="wrap">
                    {items.map((item) => (
                    <Checkbox defaultChecked>{item}</Checkbox>
                    ))}
                </Flex>
            </Box>
            <Box m='20px'>
                <Text textStyle="sm" fontWeight="medium">
                    Limit To:
                </Text>
                <Flex columnGap="10" wrap="wrap">
                    {limiters.map((item) => (
                    <Checkbox>{item}</Checkbox>
                    ))}
                </Flex>
            </Box>
            <Box m='20px'>
                <Text textStyle="sm" fontWeight="medium">
                    Sort By:
                </Text>
                <Flex columnGap="10" wrap="wrap">
                    <Select placeholder="Select an option" w='30%'  onChange={(e) => setSortOption(e.target.value)}>
                        <option>Estimated Major GPA</option>
                        <option>EAP - AAP</option>
                    </Select>
                    <Select placeholder="Select an option" w='30%'  onChange={(e) => setSortOrder(e.target.value)}>
                        <option>Ascending</option>
                        <option>Descending</option>
                    </Select>
                </Flex>
            </Box>
            <Button m='20px' mt='0px' onClick={updateFilters}>Update Filters</Button>
            <Table variant="simple" size="sm">
                <Thead>
                    <Tr style={{ whiteSpace: 'nowrap' }}>
                        <Th>Name</Th>
                        <Th>Email Address</Th>
                        <Th>EmplID</Th>
                        <Th>FTF</Th>
                        <Th>Expected Academic Progress (EAP)</Th>
                        <Th>Actual Academic Progress</Th>
                        <Th>Academic Standing</Th>
                        <Th>Estimated Major GPA</Th>
                        {terms?.map((term) => (
                            <Th>{term}</Th>
                        ))}
                        {separatedClasses.map((course) => (
                            <Th>{course}</Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {students.map((student) => (
                        <Tr key={student["Empl ID"]}>
                            <Td>{student["Name"]}</Td>
                            <Td>{student["Email Address"]}</Td>
                            <Td>{student["Empl ID"]}</Td>
                            <Td>{student["FTF"].toString()}</Td>
                            <Td>{student["Expected Academic Progress (EAP)"]}</Td>
                            <Td>{student["Actual Academic Progress"]}</Td>
                            <Td>{student["Academic Standing"]}</Td>
                            <Td>{student["Estimated Major GPA"]}</Td>
                            {terms?.map((term) => (
                                <Td>{term in student ? student[term] : "N/A"}</Td>
                            ))}
                            {separatedClasses.map((course) => {
                                const opts = course.split('-');
                                const subjects = opts[0].split("/");
                                const matchedSubject = subjects.find(subject => `${subject}-${opts[1]}` in student);

                                if (matchedSubject) {
                                    return (
                                        <Td key={course}>
                                            {student[`${matchedSubject}-${opts[1]}`] !== "" ? student[`${matchedSubject}-${opts[1]}`] : "IP"}
                                        </Td>
                                    );
                                } else {
                                    return (
                                        <Td key={course}>N/A</Td>
                                    );
                                }
                            })}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}

export default TablePage;
