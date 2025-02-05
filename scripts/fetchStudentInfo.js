const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

async function fetchStudents(driver, studentEmail) {
    let studentDict = {};

    try {
        // Navigate to the student profile search page
        await driver.get("https://dashboards.calpoly.edu/dw/polydata/student_poly_profile.search");

        // Wait for the email input field and enter student email (without @calpoly.edu)
        let emailInput = await driver.wait(until.elementLocated(By.xpath("//input[@id='p_username']")), 30000);
        await emailInput.sendKeys(studentEmail.replace("@calpoly.edu", ""), Key.RETURN);

        // Wait for search button and click it
        let searchButton = await driver.wait(until.elementLocated(By.xpath("//input[@type='submit']")), 30000);
        await searchButton.click();

        // Wait for the Personal Information section to appear
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Personal Information')]")), 10000);

        // Extract student info (Name, Email, Empl ID)
        const labels = ["Name:", "Email Address:", "Empl ID:"];
        for (const label of labels) {
            try {
                let element = await driver.findElement(By.xpath(`//li[strong[contains(text(),'${label}')]]`));
                let value = label.includes("Email Address")
                    ? await element.findElement(By.xpath("./a")).getText()
                    : (await element.getText()).split(":")[1].trim();

                studentDict[label.replace(":", "")] = value;
            } catch (error) {
                console.log(`Could not find element for '${label}', may need to update code:`, error);
            }
        }

        // Check if First-Time Freshman
        let isFTF = await driver.findElements(By.xpath("//*[contains(text(), 'First-Time Freshman')]"));
        studentDict["FTF"] = isFTF.length > 0;

        // Extract Academic Progress Stats
        try {
            let table = await driver.findElement(By.id("eapInfo"));
            let rows = await table.findElements(By.xpath(".//tr"));

            for (const row of rows) {
                let label = await row.findElement(By.xpath("./td[1]")).getText();
                let value = (await row.findElement(By.xpath("./td[2]")).getText()).split("(")[0].trim();
                studentDict[label.replace(":", "")] = value;
            }
        } catch (error) {
            console.log("Error extracting academic progress stats:", error);
        }

        // Extract Enrollment Summary (Quarterly GPA)
        let rows = await driver.findElements(By.xpath("//tr[td/a[contains(@href, '#UGRD-')]]"));
        for (const row of rows) {
            let header = await row.findElement(By.xpath(".//td/a[contains(@href, '#UGRD-')]"));
            let href = await header.getAttribute("href");
            let session = href.split("#UGRD-").pop();
            let sessionGpa = await row.findElement(By.xpath(".//td[6]")).getText();

            studentDict[session] = sessionGpa;
        }

        // Extract Grades
        let sessionTables = await driver.findElements(By.xpath("//a[contains(@name, 'UGRD-')]"));
        for (const session of sessionTables) {
            let table = await session.findElement(By.xpath("following::table[1]"));
            let rows = await table.findElements(By.xpath(".//tr[not(@class='row-shaded')]"));

            for (const row of rows) {
                let cols = await row.findElements(By.css("td"));
                if (cols.length === 8) {
                    let subject = await cols[0].getText();
                    let grade = await cols[5].getText();
                    subject = subject.split("-").slice(0, -1).join("-");

                    studentDict[subject] = grade;
                }
            }
        }

        return studentDict;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function fetchStudentInfo(students) {
    let driver = await new Builder().forBrowser("firefox").build();

    try {
        // Go to the Cal Poly portal (user logs in manually)
        await driver.get("https://myportal.calpoly.edu/");
        console.log("Please log in manually...");
        await new Promise(resolve => setTimeout(resolve, 120000)); // Wait 2 minutes for manual login

        console.log("students", students)
        console.log("Students to fetch:", students);

        let studentInfoList = [];
        for (const student of students) {
            console.log("Fetching data for:", student);
            let studentData = await fetchStudents(driver, student);
            if (studentData) studentInfoList.push(studentData);
        }

        // Save to JSON file
        const filePath = path.join(__dirname, "student_info.json");
        fs.writeFileSync(filePath, JSON.stringify(studentInfoList, null, 2));
        console.log("Data saved to", filePath);
    } finally {
        await driver.quit();
    }
}

// Export both functions together as one object
module.exports = { fetchStudentInfo, fetchStudents };
