--Do not change this file
SELECT date() as "Current Date",
e.FIRST_NAME,
e.LAST_NAME,
c.EMAIL,
c.PHONE_NUMBER,
c.ADDRESS,
c.ZIP_CODE
FROM Employee e
INNER JOIN Contact_Info c
ON e.ID = c.ID;