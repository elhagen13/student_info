import { Box, Table, Thead, Tbody, Tr, Th, Td, Flex, Text, Checkbox, Select, Button} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import data from '../student_info.json';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';


function TablePage() {
    const location = useLocation();
    const { classes } = location.state || {};
    const [separatedClasses, setSeparatedClasses] = useState({})
    const [students, setStudents] = useState(data);
    const [sortOption, setSortOption] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const items = ["Name", "Email", "Empl ID", "FTF", "Expected Academic Progress (EAP)", "Actual Academic Progress", "Academic Standing", "Estimated Major GPA", "Term GPAs", "Major Courses", "Support Courses"]
    const [itemsChecked, setItemsChecked] = useState([true, true, true, true, true, true, true, true, true, true, true])
    const limiters = ["First Time Freshmen", "Transfers"]
    const [limitChecked, setLimitChecked ] = useState([true, true])
    const [terms, setTerms] = useState([])
    
    useEffect(() => {
        const terms = new Set();
        students.forEach(student => {
            student && Object.keys(student).forEach(key => {
                if (/^\d{4}$/.test(key)){
                    terms.add(key);
                }
            })
        })
        const sortedTerms = [...terms].sort((a, b) => parseInt(a) - parseInt(b));
        setTerms([...sortedTerms])
    }, [students])

    useEffect(() => {
        const courses = {
            majorCourses: new Set(),
            supportCourses: new Set(),

        };
        if (classes?.majorCourses) {
            classes.majorCourses.forEach(course => {
                const orOpts = course.split(' or ').map(opt => opt.trim());
                orOpts.forEach(opts => {
                    const andOpts = opts.split(' & ').map(opt => opt.trim());
                    andOpts.forEach(opt => courses.majorCourses.add(opt))
                });
            });
        }
        if (classes?.supportCourses) {
            classes.supportCourses.forEach(course => {
                const orOpts = course.split(' or ').map(opt => opt.trim());
                orOpts.forEach(opts => {
                    const andOpts = opts.split(' & ').map(opt => opt.trim());
                    andOpts.forEach(opt => courses.supportCourses.add(opt))
                });
            });
        }
        setSeparatedClasses({
            majorCourses: [...courses.majorCourses],
            supportCourses: [...courses.supportCourses]
        })
    }, [classes]);

    const updateFilters = () => {
        let students = data;

        if(!limitChecked[0]){
            students = [...students].filter((student) => !student.FTF)
        }
        if(!limitChecked[1]){
            students = [...students].filter((student) => student.FTF)
        }

        if (sortOption === "Estimated Major GPA") {
            students = [...students].sort((a, b) => {
                const aGPA = parseFloat(a["Estimated Major GPA"]);
                const bGPA = parseFloat(b["Estimated Major GPA"]);
                return sortOrder === "Ascending" ? aGPA - bGPA : bGPA - aGPA;
            });
        }
        else if(sortOption === "EAP - AAP"){
            students = [...students].sort((a, b) => {
                const aDiff = parseFloat(a["Expected Academic Progress (EAP)"].slice(0, -1) - a["Actual Academic Progress"].slice(0, -1));
                const bDiff = parseFloat(b["Expected Academic Progress (EAP)"].slice(0, -1) - b["Actual Academic Progress"].slice(0, -1));
                return sortOrder === "Ascending" ? aDiff - bDiff : bDiff - aDiff;
            });
        }

        setStudents(students)
    }
    
    useEffect(() => {
        updateFilters();
    }, [limitChecked, students, sortOption, sortOrder]);

    const exportToExcel = () => {
        const table = document.querySelector("table"); // Select the table you want to export
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
        XLSX.writeFile(wb, "students_table.xlsx"); // Name of the exported file
    };
      
 
    return (
        <Box p='20px'> 
            <Box m='20px'>
                <Text textStyle="sm" fontWeight="medium">
                    Select Columns
                </Text>
                <Flex columnGap="10" wrap="wrap">
                    {items.map((item, index) => (
                    <Checkbox isChecked={itemsChecked[index]} onChange={() => setItemsChecked(
                        (prev) => prev.map((item, i) => (i === index) ? !item : item))
                    }>
                        {item}
                    </Checkbox>
                    ))}
                </Flex>
            </Box>
            <Box m='20px'>
                <Text textStyle="sm" fontWeight="medium">
                    Limit To:
                </Text>
                <Flex columnGap="10" wrap="wrap">
                    {limiters.map((item, index) => (
                    <Checkbox isChecked={limitChecked[index]}  onChange={() => {setLimitChecked((prev) => prev.map((item, i) => (i === index) ? !item : item))}}>
                        {item}
                    </Checkbox>
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
            <Button m='20px' onClick={exportToExcel}>Export to Excel</Button>
            <Box overflowX='scroll'>
                <Table variant="simple" size="sm" overflow='scroll'>
                    <Thead>
                        <Tr style={{ whiteSpace: 'nowrap' }}>
                            {itemsChecked[0] && <Th>Name</Th>}
                            {itemsChecked[1] && <Th>Email Address</Th>}
                            {itemsChecked[2] && <Th>EmplID</Th>}
                            {itemsChecked[3] && <Th>FTF</Th>}
                            {itemsChecked[4] && <Th>Expected Academic Progress (EAP)</Th>}
                            {itemsChecked[5] && <Th>Actual Academic Progress</Th>}
                            {itemsChecked[6] && <Th>Academic Standing</Th>}
                            {itemsChecked[7] && <Th>Estimated Major GPA</Th>}
                            {terms?.map((term) => (
                                itemsChecked[8] && <Th>{term}</Th>
                            ))}
                            {separatedClasses.majorCourses && separatedClasses.majorCourses.map((course, idx) => (
                                itemsChecked[9] && <Th key={idx}>{course}</Th>
                            ))}
                            {separatedClasses.supportCourses && separatedClasses.supportCourses.map((course, idx) => (
                                itemsChecked[10] && <Th key={idx}>{course}</Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {students?.map((student, index) => (
                            <Tr key={index}>
                                {student && itemsChecked[0] && <Td>{student["Name"]}</Td>}
                                {student && itemsChecked[1] && <Td>{student["Email Address"]}</Td>}
                                {student && itemsChecked[2] &&<Td>{student["Empl ID"]}</Td>}
                                {student && itemsChecked[3] && <Td>{student["FTF"] ? "ftf" : "transfer"}</Td>}
                                {student && itemsChecked[4] && <Td>{student["Expected Academic Progress (EAP)"]}</Td>}
                                {student && itemsChecked[5] && <Td>{student["Actual Academic Progress"]}</Td>}
                                {student && itemsChecked[6] && <Td>{student["Academic Standing"]}</Td>}
                                {student && itemsChecked[7] && <Td>{student["Estimated Major GPA"]}</Td>}
                                {student && itemsChecked[8] && terms?.map((term) => (
                                    <Td>{term in student ? student[term] : "N/A"}</Td>
                                ))}
                                {itemsChecked[9] && separatedClasses.majorCourses && separatedClasses.majorCourses.map((course) => {
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
                                {itemsChecked[10] && separatedClasses.supportCourses && separatedClasses.supportCourses.map((course) => {
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
        </Box>
    );
}

export default TablePage;


