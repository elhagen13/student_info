const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

async function fetchStudents(driver, studentEmail) {
    let studentDict = {};

    try {
        await driver.sleep(20000);

        // Navigate to the student profile search page
        //await driver.get("https://dashboards.calpoly.edu/dw/polydata/student_poly_profile.search");
        await driver.get("https://dashboards.calpoly.edu/dw/polydata/student_poly_profile_self_svc.display")
        // Wait for the email input field and enter student email (without @calpoly.edu)
        /*
        let emailInput = await driver.wait(until.elementLocated(By.xpath("//input[@id='p_username']")), 30000);
        await emailInput.sendKeys(studentEmail.replace("@calpoly.edu", ""), Key.RETURN);

        // Wait for search button and click it
        let searchButton = await driver.wait(until.elementLocated(By.xpath("//input[@type='submit']")), 30000);
        await searchButton.click();
        */
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

async function* fetchStudentInfo(students, username, password) {
    let options = new chrome.Options();
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Phase 1: Login
        yield { status: "Starting browser session..." };
        
        await driver.get("https://myportal.calpoly.edu/");
        yield { status: "Loading login page..." };

        // Username
        const usernameField = await driver.wait(until.elementLocated(By.id("username")), 10000);
        await usernameField.sendKeys(username);
        yield { status: "Username entered" };

        // Password
        await driver.sleep(500);
        const passwordField = await driver.wait(until.elementLocated(By.id("password")), 10000);
        await passwordField.sendKeys(password);
        yield { status: "Password entered" };

        // Submit
        const submitButton = await driver.findElement(By.name("_eventId_proceed"));
        await submitButton.click();
        yield { status: "Logging in..." };

        // Error handling
        try {
            const incorrect = await driver.wait(
                until.elementLocated(By.xpath("//*[contains(text(), 'incorrect')]")), 
                1000
            );
            if (incorrect) throw new Error("Invalid credentials");
        } catch (e) {
            if (e.name !== 'TimeoutError') throw e;
        }

        // Verification
        try {
            const codeElement = await driver.wait(
                until.elementLocated(By.css('.verification-code')),
                5000
            );
            const code = await codeElement.getText();
            yield { status: `Verification code: ${code}` };
        } catch (e) {
            if (e.name !== 'TimeoutError') throw e;
        }

        // Duo Auth
        const duoButton = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Yes, this is my device')]")),
            50000
        );
        await duoButton.click();
        yield { status: "Waiting for Duo authentication..." };

        // Phase 2: Data Collection
        let studentInfoList = [];
        for (const [index, student] of students.entries()) {
            yield { 
                status: `Fetching data for student ${index + 1}/${students.length}`,
                progress: Math.round((index / students.length) * 100)
            };
            
            let studentData = await fetchStudents(driver, student);
            if (studentData) {
                studentInfoList.push(studentData);
                yield {
                    status: `Completed student ${index + 1}`,
                    current: studentData.Name,
                    progress: Math.round(((index + 1) / students.length) * 100)
                };
            }
        }

        // Final result
        yield { students: studentInfoList };
        
    } catch (error) {
        yield { error: error.message };
        throw error;
    } finally {
        await driver.quit();
    }
}

// Export both functions together as one object
module.exports = { fetchStudentInfo, fetchStudents };

//fetchStudentInfo(["elhagen@calpoly.edu"], "elhagen@calpoly.edu", "CalPolyPassword:)")