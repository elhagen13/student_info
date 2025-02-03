from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
import os
import time
import sys
import json


def fetchStudents(driver, student_email):
    student_dict = {}
    actions = ActionChains(driver)

    try:
        #TODO: change this to other code where itll look each student up        
        driver.get("https://dashboards.calpoly.edu/dw/polydata/student_poly_profile.search")
            
        email_input = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.XPATH, "//input[@id='p_username']"))
        )
        actions.move_to_element(email_input).click().send_keys(student_email[:-12]).perform()

        search = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='submit']"))
        )
        search.click()

        time.sleep(10)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Personal Information')]"))
        )
        #-------------------------------------------------------------------------------
        #Student Info (Name, Email, Empl ID)
        labels = ["Name:", "Email Address:", "Empl ID:"]
        for label in labels:
            try: 
                element = driver.find_element(By.XPATH, f"//li[strong[contains(text(),'{label}')]]")
                if "Email Address" in label:
                    value = element.find_element(By.XPATH, "./a").text
                else:
                    value = element.text.split(":")[1].strip()
            
                student_dict[label[:-1]] = value
            except Exception as e:
                print(f"Could not find element for label '{label}', may need to update code: {e}")


        #-------------------------------------------------------------------------------
        #First Time Freshman?
        elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'First-Time Freshman')]")
        if elements:
            student_dict["FTF"] = True
        else:
            student_dict["FTF"] = False

        #-------------------------------------------------------------------------------
        #Academic Progress Stats:

        table = driver.find_element(By.ID, "eapInfo")
        rows = table.find_elements(By.XPATH, ".//tr")

        for row in rows:
            label = row.find_element(By.XPATH, "./td[1]").text.strip(":")
            value = row.find_element(By.XPATH, "./td[2]").text.split("(")[0].strip()
            student_dict[label] = value


        #-------------------------------------------------------------------------------
        #Enrollment summary:

        #Current table format:
        #Term   Units Att   Units Earned    Units Graded    Grade Points    GPA ...
        
        #6th column (quarterly GPA) and term number are what are needed   
        rows = driver.find_elements(By.XPATH, "//tr[td/a[contains(@href, '#UGRD-')]]")

        for row in rows:
            header = row.find_element(By.XPATH, ".//td/a[contains(@href, '#UGRD-')]")
            href = header.get_attribute('href')
            session = href.split("#UGRD-")[-1]
            session_gpa = row.find_element(By.XPATH, ".//td[6]").text.strip()
            
            student_dict[session] = session_gpa

        
        #-------------------------------------------------------------------------------
        #Grades
        session_tables = driver.find_elements(By.XPATH, "//a[contains(@name, 'UGRD-')]")

        for session in session_tables:
            table = session.find_element(By.XPATH, "following::table[1]")
            rows = table.find_elements(By.XPATH, ".//tr[not(@class='row-shaded')]")
            for row in rows:
                cols = row.find_elements(By.TAG_NAME, "td")
        
                if len(cols) == 8:
                    # Extract data from each column (e.g., Subject, Title, Units, Grade)
                    subject = cols[0].text
                    title = cols[1].text
                    units_attended = cols[2].text
                    units_earned = cols[3].text
                    units_graded = cols[4].text
                    grade = cols[5].text
                    grade_points = cols[6].text

                    subject= "-".join(subject.split("-")[:-1])
            
                    student_dict[subject] = grade
        
        return student_dict
    except Exception as e:
        print(f"Error: {e}")

    

if __name__ == "__main__":
    #chrome_options = Options()
    #driver = webdriver.Chrome(options=chrome_options)
    driver = webdriver.Firefox()
    #Go to CalPoly portal
    driver.get("https://myportal.calpoly.edu/")
    #This allows the user to login
    time.sleep(120)
    
    #navigateToStudentSearch(driver)
    students = json.loads(sys.argv[1])
    print(students) 
    student_info_list = []
    
    for student in students:
        print(student)
        student_info_list.append(fetchStudents(driver, student))

    # Define the file path for student_info.json
    file_path = os.path.join(os.getcwd(), 'src', 'student_info.json')
    with open(file_path, 'w') as f:
        json.dump(student_info_list, f)


    