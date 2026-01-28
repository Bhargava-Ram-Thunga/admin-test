// import { emitWarning } from "process";

export const INITIAL_USERS = [
    {
        email: "super@admin.com",
        name: "Super Admin",
        role: "Super Admin",
        regionId: "ALL",
        avatarUrl: "https://i.pravatar.cc/150?u=super",
        password: "123",
    },
    {
        email: "state.admin@kodingc.com",
        name: "Suresh Rao",
        role: "State Admin",
        regionId: "S-01",
        avatarUrl: "https://i.pravatar.cc/150?u=state",
        password: "123",
    },
    {
        email: "district.hq@kodingc.com",
        name: "Priya K",
        role: "District HQ",
        regionId: "D-01",
        avatarUrl: "https://i.pravatar.cc/150?u=dist",
        password: "123",
    },
    {
        email: "division.hq@kodingc.com",
        name: "Ramesh T",
        role: "Division HQ",
        regionId: "DIV-01",
        avatarUrl: "https://i.pravatar.cc/150?u=div",
        password: "123",
    },
    {
        email: "const.hq@kodingc.com",
        name: "Anita S",
        role: "Constituency HQ",
        regionId: "CONST-01",
        avatarUrl: "https://i.pravatar.cc/150?u=const",
        password: "123",
    },
    {
        email: "mandal.hq@kodingc.com",
        name: "Swathi M",
        role: "Mandal HQ",
        regionId: "MAN-01",
        avatarUrl: "https://i.pravatar.cc/150?u=man",
        password: "123",
    }

];


export const MOCK_HIERARCHY = [
    {
        id: "S-01",
        name: "Telangana",
        type: "State",
        children: [
            {
                id: "D-01",
                name: "Hyderabad",
                type: "District",
                children: [
                    {
                        id: "DIV-01",
                        name: "Central Zone",
                        type: "Division",
                        children: [
                            {
                                id: "CONST-01",
                                name: "Khairatabad",
                                type: "Constituency",
                                children: [
                                    {
                                        id: "MAN-01",
                                        name: "Somajiguda",
                                        type: "Mandal",
                                        children: [],
                                    },
                                    {
                                        id: "MAN-02",
                                        name: "Punjagutta",
                                        type: "Mandal",
                                        children: [],
                                    },
                                ],
                            },
                            {
                                id: "CONST-02",
                                name: "Jubilee Hills",
                                type: "Constituency",
                                children: [
                                    {
                                        id: "MAN-03",
                                        name: "Shaikpet",
                                        type: "Mandal",
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: "DIV-02",
                        name: "North Zone",
                        type: "Division",
                        children: [
                            {
                                id: "CONST-03",
                                name: "Secunderabad",
                                type: "Constituency",
                                children: [
                                    {
                                        id: "MAN-04",
                                        name: "Begumpet",
                                        type: "Mandal",
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: "D-02",
                name: "Warangal",
                type: "District",
                children: [
                    {
                        id: "DIV-03",
                        name: "Warangal Urban",
                        type: "Division",
                        children: [
                            {
                                id: "CONST-04",
                                name: "Warangal East",
                                type: "Constituency",
                                children: [
                                    {
                                        id: "MAN-05",
                                        name: "Hanamkonda",
                                        type: "Mandal",
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const MOCK_TRAINERS = [
    {
        id: "T1",
        name: "Ravi Teja",
        regionId: "MAN-01",
        regionName: "Somajiguda",
        status: "Active",
        students: 12, // Initial count
        capacity: 30, // New field
        rating: 4.8,
        avatarUrl: "https://i.pravatar.cc/150?u=t1",
        lastLocation: "Active now near Raj Bhavan Rd",
    },
    {
        id: "T2",
        name: "Lakshmi Narayan",
        regionId: "MAN-02",
        regionName: "Punjagutta",
        status: "Pending",
        students: 0,
        capacity: 20, // New field
        rating: 0,
        avatarUrl: "https://i.pravatar.cc/150?u=t2",
    },
    {
        id: "T3",
        name: "Vikram Raju",
        regionId: "MAN-05",
        regionName: "Hanamkonda",
        status: "Active",
        students: 25,
        capacity: 30,
        rating: 4.5,
        avatarUrl: "https://i.pravatar.cc/150?u=t3",
        lastLocation: "Last seen 2h ago at Hanamkonda",
    },
    {
        id: "T4",
        name: "Saanvi Krishna",
        regionId: "MAN-03",
        regionName: "Shaikpet",
        status: "Active",
        students: 30,
        capacity: 30,
        rating: 4.9,
        avatarUrl: "https://i.pravatar.cc/150?u=t4",
        lastLocation: "Active now near MVP Colony",
    },
];

export const INITIAL_STUDENTS = [
    {
        id: "1",
        name: "Aarav Patel",
        regionId: "MAN-01",
        regionName: "Somajiguda",
        course: "Python Basics",
        status: "Active",
        paymentStatus: "Pending",
        amount: "15000",
        enrollmentDate: "2025-02-19",
        avatarUrl: "https://i.pravatar.cc/150?u=1",
        mentorId: "T1",
        mentorName: "Ravi Teja",
    },
    {
        id: "2",
        name: "Vivaan Singh",
        regionId: "MAN-01",
        regionName: "Somajiguda",
        course: "Web Dev",
        status: "Completed",
        paymentStatus: "Paid",
        amount: "25000",
        enrollmentDate: "2025-02-18",
        avatarUrl: "https://i.pravatar.cc/150?u=2",
        mentorId: null,
        mentorName: null,
    },
    {
        id: "3",
        name: "Diya Reddy",
        regionId: "MAN-02",
        regionName: "Punjagutta",
        course: "Data Science",
        status: "Active",
        paymentStatus: "Paid",
        amount: "30000",
        enrollmentDate: "2025-04-16",
        avatarUrl: "https://i.pravatar.cc/150?u=3",
        mentorId: null,
        mentorName: null,
    },
    {
        id: "4",
        name: "Ishaan Kumar",
        regionId: "MAN-05",
        regionName: "Hanamkonda",
        course: "Cyber Security",
        status: "Dropped",
        paymentStatus: "Overdue",
        amount: "20000",
        enrollmentDate: "2025-03-02",
        avatarUrl: "https://i.pravatar.cc/150?u=4",
        mentorId: null,
        mentorName: null,
    },
    {
        id: "5",
        name: "Ananya Gupta",
        regionId: "MAN-04",
        regionName: "Begumpet",
        course: "AI Basics",
        status: "Active",
        paymentStatus: "Paid",
        amount: "35000",
        enrollmentDate: "2025-01-10",
        avatarUrl: "https://i.pravatar.cc/150?u=5",
        mentorId: null,
        mentorName: null,
    },
    {
        id: "6",
        name: "Karthik Raja",
        regionId: "MAN-03",
        regionName: "Shaikpet",
        course: "Full Stack Dev",
        status: "Active",
        paymentStatus: "Paid",
        amount: "45000",
        enrollmentDate: "2024-12-12",
        avatarUrl: "https://i.pravatar.cc/150?u=6",
        mentorId: "T4",
        mentorName: "Saanvi Krishna",
    },
    {
        id: "7",
        name: "Meera Nair",
        regionId: "MAN-01",
        regionName: "Somajiguda",
        course: "UI/UX Design",
        status: "Active",
        paymentStatus: "Paid",
        amount: "22000",
        enrollmentDate: "2025-01-05",
        avatarUrl: "https://i.pravatar.cc/150?u=7",
        mentorId: "T1",
        mentorName: "Ravi Teja",
    },
    {
        id: "8",
        name: "Rahul Varma",
        regionId: "MAN-05",
        regionName: "Hanamkonda",
        course: "Cloud Computing",
        status: "Completed",
        paymentStatus: "Paid",
        amount: "40000",
        enrollmentDate: "2024-11-20",
        avatarUrl: "https://i.pravatar.cc/150?u=8",
        mentorId: "T3",
        mentorName: "Vikram Raju",
    },
    {
        id: "9",
        name: "Saanvi Rao",
        regionId: "MAN-02",
        regionName: "Punjagutta",
        course: "Data Analytics",
        status: "Active",
        paymentStatus: "Pending",
        amount: "28000",
        enrollmentDate: "2025-02-15",
        avatarUrl: "https://i.pravatar.cc/150?u=9",
        mentorId: null,
        mentorName: null,
    },
    {
        id: "10",
        name: "Vikram Singh",
        regionId: "MAN-03",
        regionName: "Shaikpet",
        course: "Python Basics",
        status: "Dropped",
        paymentStatus: "Overdue",
        amount: "15000",
        enrollmentDate: "2025-01-10",
        avatarUrl: "https://i.pravatar.cc/150?u=10",
        mentorId: "T4",
        mentorName: "Saanvi Krishna",
    },
];

export const MOCK_SOS = [
    {
        id: "SOS-01",
        type: "Medical Emergency",
        severity: "Critical",
        location: "Somajiguda Center",
        regionId: "MAN-01",
        time: "10 mins ago",
        status: "Active",
    },
    {
        id: "SOS-02",
        type: "Dispute",
        severity: "High",
        location: "Warangal Branch",
        regionId: "MAN-05",
        time: "2 hours ago",
        status: "Active",
    },
    {
        id: "SOS-03",
        type: "Fire Alarm",
        severity: "Critical",
        location: "Shaikpet Lab",
        regionId: "MAN-03",
        time: "5 mins ago",
        status: "Active",
    },
];

export const REVENUE_DATA = [
    { name: "Mon", revenue: 40000 },
    { name: "Tue", revenue: 30000 },
    { name: "Wed", revenue: 20000 },
    { name: "Thu", revenue: 27800 },
    { name: "Fri", revenue: 18900 },
    { name: "Sat", revenue: 23900 },
    { name: "Sun", revenue: 34900 },
];

export const MOCK_REVENUE_DATA = [
    { name: "Jan", revenue: 45000 },
    { name: "Feb", revenue: 52000 },
    { name: "Mar", revenue: 48000 },
    { name: "Apr", revenue: 61000 },
    { name: "May", revenue: 55000 },
    { name: "Jun", revenue: 67000 },
    { name: "Jul", revenue: 72000 },
    { name: "Aug", revenue: 69000 },
    { name: "Sep", revenue: 78000 },
    { name: "Oct", revenue: 85000 },
    { name: "Nov", revenue: 92000 },
    { name: "Dec", revenue: 105000 },
];

export const MOCK_ALLOCATIONS = [
    {
        id: "A-1001",
        studentId: "1",
        studentName: "Aarav Patel",
        trainerId: "T1",
        trainerName: "Ravi Teja",
        courseId: "C1",
        courseName: "Python Basics",
        status: "Active",
        requestedDate: "2025-02-15",
        allocatedDate: "2025-02-16",
        allocatedBy: "Super Admin",
        sessionCount: 20,
        scheduleMode: "WEEKDAY_DAILY",
        timeSlot: "4:00 PM",
        startDate: "2025-02-17",
        notes: "Student prefers evening slots."
    },
    {
        id: "A-1002",
        studentId: "2",
        studentName: "Vivaan Singh",
        trainerId: null,
        trainerName: null,
        courseId: "C2",
        courseName: "Web Dev",
        status: "Pending",
        requestedDate: "2025-05-01",
        sessionCount: 10,
        scheduleMode: "SUNDAY_ONLY",
        timeSlot: "9:00 AM",
        startDate: "2025-05-05",
        notes: "Waiting for trainer availability in Somajiguda."
    },
    {
        id: "A-1003",
        studentId: "3",
        studentName: "Diya Reddy",
        trainerId: "T2",
        trainerName: "Lakshmi Narayan",
        courseId: "C3",
        courseName: "Data Science",
        status: "Completed",
        requestedDate: "2025-01-10",
        allocatedDate: "2025-01-11",
        allocatedBy: "Suresh Rao",
        sessionCount: 30,
        scheduleMode: "WEEKDAY_DAILY",
        timeSlot: "6:00 PM",
        startDate: "2025-01-15",
    }
];

export const MOCK_SESSIONS = [
    {
        id: "S-5001",
        allocationId: "A-1001",
        studentId: "1",
        studentName: "Aarav Patel",
        trainerId: "T1",
        trainerName: "Ravi Teja",
        courseName: "Python Basics",
        scheduledDate: "2025-05-20",
        scheduledTime: "16:00",
        duration: 60,
        status: "Scheduled",
        gpsStatus: "Pending",
        faceStatus: "Pending",
    },
    {
        id: "S-5002",
        allocationId: "A-1001",
        studentId: "1",
        studentName: "Aarav Patel",
        trainerId: "T1",
        trainerName: "Ravi Teja",
        courseName: "Python Basics",
        scheduledDate: "2025-05-19",
        scheduledTime: "16:00",
        duration: 60,
        status: "Completed",
        gpsStatus: "Passed",
        faceStatus: "Passed",
        actualDuration: 58,
        actualStartTime: "16:02",
        actualEndTime: "17:00",
    },
    {
        id: "S-5003",
        allocationId: "A-1003",
        studentId: "3",
        studentName: "Diya Reddy",
        trainerId: "T2",
        trainerName: "Lakshmi Narayan",
        courseName: "Data Science",
        scheduledDate: "2025-04-10",
        scheduledTime: "18:00",
        duration: 90,
        status: "Disputed",
        gpsStatus: "Failed",
        faceStatus: "Passed",
    }
];

export const MOCK_RESCHEDULES = [
    {
        id: "R-001",
        sessionId: "S-5001",
        studentName: "Aarav Patel",
        trainerName: "Ravi Teja",
        courseName: "Python Basics",
        originalDate: "2025-05-20",
        originalTime: "16:00",
        newDate: "2025-05-21",
        newTime: "10:00",
        requestedBy: "Student",
        reason: "Medical Emergency",
        status: "Pending",
        requestedAt: "2025-05-18T10:00:00Z"
    }
];

export const MOCK_AUTO_ASSIGNMENTS = [
    {
        id: "AA-001",
        studentName: "Vivaan Singh",
        courseName: "Web Dev",
        assignedTrainer: "Ravi Teja",
        assignmentDate: "2025-05-01",
        status: "Failed",
        method: "Auto",
        retryCount: 1,
        criteria: {
            proximity: 5.2,
            specialtyMatch: true
        }
    }
];

export const MOCK_CALENDAR_SESSIONS = [
    {
        id: "S-CAL-001",
        studentName: "Aarav Patel",
        trainerName: "Ravi Teja",
        courseName: "Python Basics",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 1st of current month
        time: "10:00",
        duration: 60,
        status: "Completed",
        trainerId: "T1",
        studentId: "1"
    },
    {
        id: "S-CAL-002",
        studentName: "Vivaan Singh",
        trainerName: "Ravi Teja",
        courseName: "Web Dev",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 2), // 2nd of current month
        time: "14:00",
        duration: 90,
        status: "Scheduled",
        trainerId: "T1",
        studentId: "2"
    },
    {
        id: "S-CAL-003",
        studentName: "Diya Reddy",
        trainerName: "Lakshmi Narayan",
        courseName: "Data Science",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 5), // 5th
        time: "11:00",
        duration: 60,
        status: "Scheduled",
        trainerId: "T2",
        studentId: "3"
    },
    {
        id: "S-CAL-004",
        studentName: "Ishaan Kumar",
        trainerName: "Vikram Raju",
        courseName: "Cyber Security",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 5), // Conflict potential (same day)
        time: "11:00",
        duration: 60,
        status: "Cancelled",
        trainerId: "T3",
        studentId: "4"
    },
    {
        id: "S-CAL-005",
        studentName: "Ananya Gupta",
        trainerName: "Saanvi Krishna",
        courseName: "AI Basics",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
        time: "09:00",
        duration: 120,
        status: "In Progress",
        trainerId: "T4",
        studentId: "5"
    },
    {
        id: "S-CAL-006",
        studentName: "Karthik Raja",
        trainerName: "Saanvi Krishna",
        courseName: "Full Stack Dev",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
        time: "15:00",
        duration: 60,
        status: "Scheduled",
        trainerId: "T4",
        studentId: "6"
    },
    {
        id: "S-CAL-007",
        studentName: "Meera Nair",
        trainerName: "Ravi Teja",
        courseName: "UI/UX Design",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
        time: "10:00",
        duration: 60,
        status: "Disputed",
        trainerId: "T1",
        studentId: "7"
    },
    {
        id: "S-CAL-008",
        studentName: "Rahul Varma",
        trainerName: "Vikram Raju",
        courseName: "Cloud Computing",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 18),
        time: "16:00",
        duration: 60,
        status: "Scheduled",
        trainerId: "T3",
        studentId: "8"
    },
    {
        id: "S-CAL-009",
        studentName: "Saanvi Rao",
        trainerName: "Lakshmi Narayan",
        courseName: "Data Analytics",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
        time: "13:00",
        duration: 60,
        status: "Scheduled",
        trainerId: "T2",
        studentId: "9"
    },
    {
        id: "S-CAL-010",
        studentName: "Vikram Singh",
        trainerName: "Saanvi Krishna",
        courseName: "Python Basics",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
        time: "11:00",
        duration: 60,
        status: "Scheduled",
        trainerId: "T4",
        studentId: "10"
    },
    {
        id: "S-CAL-011",
        studentName: "Conflict Demo 1",
        trainerName: "Ravi Teja",
        courseName: "Python Basics",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
        time: "10:00",
        duration: 60,
        status: "Scheduled",
        trainerId: "T1",
        studentId: "C1"
    },
    {
        id: "S-CAL-012",
        studentName: "Conflict Demo 2",
        trainerName: "Ravi Teja",
        courseName: "Web Dev",
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
        time: "10:30", // Overlap!
        duration: 60,
        status: "Scheduled",
        trainerId: "T1",
        studentId: "C2"
    }
];

export const MOCK_GROWTH_DATA = {
    daily: [
        { name: "Mon", students: 12, instructors: 2 },
        { name: "Tue", students: 18, instructors: 1 },
        { name: "Wed", students: 15, instructors: 3 },
        { name: "Thu", students: 25, instructors: 4 },
        { name: "Fri", students: 20, instructors: 2 },
        { name: "Sat", students: 30, instructors: 5 },
        { name: "Sun", students: 10, instructors: 1 },
    ],
    weekly: [
        { name: "Week 1", students: 80, instructors: 12 },
        { name: "Week 2", students: 120, instructors: 15 },
        { name: "Week 3", students: 150, instructors: 18 },
        { name: "Week 4", students: 200, instructors: 25 },
    ],
    monthly: [
        { name: "Jan", students: 400, instructors: 50 },
        { name: "Feb", students: 600, instructors: 65 },
        { name: "Mar", students: 550, instructors: 60 },
        { name: "Apr", students: 800, instructors: 85 },
        { name: "May", students: 950, instructors: 90 },
        { name: "Jun", students: 1100, instructors: 100 },
    ]
};


export const MOCK_REGION_LEVELS_DATA: Record<string, { name: string; students: number; sessions: number }[]> = {
    "State": [
        { name: "Telangana", students: 12500, sessions: 3200 },
        { name: "Andhra Pradesh", students: 9800, sessions: 2100 },
        { name: "Karnataka", students: 8500, sessions: 1800 },
        { name: "Maharashtra", students: 7200, sessions: 1500 },
    ],
    "District": [
        { name: "Hyderabad", students: 450, sessions: 120 },
        { name: "Warangal", students: 320, sessions: 90 },
        { name: "Nizamabad", students: 210, sessions: 60 },
        { name: "Karimnagar", students: 180, sessions: 45 },
        { name: "Khammam", students: 150, sessions: 40 },
        { name: "Rangareddy", students: 400, sessions: 110 },
    ],
    "Division": [
        { name: "Central Zone", students: 150, sessions: 45 },
        { name: "North Zone", students: 120, sessions: 35 },
        { name: "South Zone", students: 100, sessions: 25 },
        { name: "East Zone", students: 80, sessions: 15 },
        { name: "West Zone", students: 180, sessions: 55 },
    ],
    "Constituency": [
        { name: "Khairatabad", students: 80, sessions: 20 },
        { name: "Jubilee Hills", students: 70, sessions: 18 },
        { name: "Secunderabad", students: 60, sessions: 15 },
        { name: "Nampally", students: 50, sessions: 12 },
        { name: "Amberpet", students: 45, sessions: 10 },
    ],
    "Mandal": [
        { name: "Somajiguda", students: 40, sessions: 10 },
        { name: "Punjagutta", students: 35, sessions: 8 },
        { name: "Shaikpet", students: 30, sessions: 7 },
        { name: "Begumpet", students: 25, sessions: 6 },
        { name: "Hanamkonda", students: 20, sessions: 5 },
    ],
    "Village": [
        { name: "Village A", students: 15, sessions: 3 },
        { name: "Village B", students: 12, sessions: 2 },
        { name: "Village C", students: 10, sessions: 2 },
        { name: "Village D", students: 8, sessions: 1 },
        { name: "Village E", students: 5, sessions: 1 },
    ]
};

// Keeping this for backward compatibility if needed, but pointing to District default
export const MOCK_REGION_DISTRIBUTION = MOCK_REGION_LEVELS_DATA["District"];

