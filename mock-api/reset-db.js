import fs from "fs";
import path from "path";

// Reset database to initial state
const initialData = {
  customers: [
    {
      id: 1,
      name: "Ahmed Hassan",
      phoneNumber: "+971501234567",
      gender: "male",
      organization: "Al Wasel Technologies",
      department: "Engineering",
      dateOfBirth: "1990-05-15",
    },
    {
      id: 2,
      name: "Fatima Al-Zahra",
      phoneNumber: "+971509876543",
      gender: "female",
      organization: "Al Wasel Technologies",
      department: "Human Resources",
      dateOfBirth: "1988-12-22",
    },
    {
      id: 3,
      name: "Omar Abdullah",
      phoneNumber: "+971507654321",
      gender: "male",
      organization: "Digital Solutions LLC",
      department: "Marketing",
      dateOfBirth: "1992-03-08",
    },
    {
      id: 4,
      name: "Aisha Mohammed",
      phoneNumber: "+971503456789",
      gender: "female",
      organization: "Al Wasel Technologies",
      department: "Finance",
      dateOfBirth: "1985-09-14",
    },
    {
      id: 5,
      name: "Khalid Al-Mansouri",
      phoneNumber: "+971502345678",
      gender: "male",
      organization: "Innovation Hub",
      department: "Research & Development",
      dateOfBirth: "1991-07-30",
    },
  ],
};

const dbPath = path.join(__dirname, "db.json");

fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
console.log("Database reset to initial state successfully!");
