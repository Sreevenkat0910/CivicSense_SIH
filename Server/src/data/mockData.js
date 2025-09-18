// Mock Data for CivicSense Application
// This file contains static data for testing without database

export const mockUsers = [
  {
    id: "user-001",
    user_id: "user-001",
    full_name: "Rajesh Kumar",
    email: "admin@civicsense.com",
    mobile: "+91 9876543210",
    language: "en",
    password_hash: "$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV", // password: admin123
    usertype_id: 1,
    department: "Administration",
    mandal_area: "Central Zone",
    is_active: true,
    usertype: {
      usertype_id: 1,
      type_name: "admin",
      description: "System Administrator",
      permissions: ["all"]
    }
  },
  {
    id: "user-002",
    user_id: "user-002",
    full_name: "Priya Sharma",
    email: "priya@civicsense.com",
    mobile: "+91 9876543211",
    language: "en",
    password_hash: "$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV", // password: public123
    usertype_id: 2,
    department: "Public Works",
    mandal_area: "North Zone",
    is_active: true,
    usertype: {
      usertype_id: 2,
      type_name: "department",
      description: "Department Head",
      permissions: ["department_management", "reports_view", "reports_update"]
    }
  },
  {
    id: "user-003",
    user_id: "user-003",
    full_name: "Amit Patel",
    email: "amit@civicsense.com",
    mobile: "+91 9876543212",
    language: "en",
    password_hash: "$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV", // password: water123
    usertype_id: 2,
    department: "Water Department",
    mandal_area: "South Zone",
    is_active: true,
    usertype: {
      usertype_id: 2,
      type_name: "department",
      description: "Department Head",
      permissions: ["department_management", "reports_view", "reports_update"]
    }
  },
  {
    id: "user-004",
    user_id: "user-004",
    full_name: "Sunita Reddy",
    email: "mandal@civicsense.com",
    mobile: "+91 9876543213",
    language: "en",
    password_hash: "$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV", // password: mandal123
    usertype_id: 3,
    department: "Administration",
    mandal_area: "All Zones",
    is_active: true,
    usertype: {
      usertype_id: 3,
      type_name: "mandal-admin",
      description: "Mandal Administrator",
      permissions: ["mandal_management", "department_view", "reports_view", "reports_update"]
    }
  },
  {
    id: "user-005",
    user_id: "user-005",
    full_name: "Vikram Rao",
    email: "citizen@civicsense.com",
    mobile: "+91 9876543214",
    language: "en",
    password_hash: "$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV", // password: citizen123
    usertype_id: 4,
    department: null,
    mandal_area: "Central Zone",
    is_active: true,
    usertype: {
      usertype_id: 4,
      type_name: "citizen",
      description: "Citizen",
      permissions: ["report_create", "report_view_own"]
    }
  }
];

export const mockUserTypes = [
  {
    usertype_id: 1,
    type_name: "admin",
    description: "System Administrator",
    permissions: ["all"]
  },
  {
    usertype_id: 2,
    type_name: "department",
    description: "Department Head",
    permissions: ["department_management", "reports_view", "reports_update"]
  },
  {
    usertype_id: 3,
    type_name: "mandal-admin",
    description: "Mandal Administrator",
    permissions: ["mandal_management", "department_view", "reports_view", "reports_update"]
  },
  {
    usertype_id: 4,
    type_name: "citizen",
    description: "Citizen",
    permissions: ["report_create", "report_view_own"]
  }
];

export const mockReports = [
  {
    id: "report-001",
    report_id: "CIV-2024-001",
    title: "Broken Street Light",
    description: "Street light on Main Road near Central Park is not working for the past 3 days",
    category: "Infrastructure",
    priority: "medium",
    status: "pending",
    location: "Main Road, Central Park",
    latitude: 18.4361,
    longitude: 79.1282,
    images: ["https://via.placeholder.com/300x200?text=Broken+Light"],
    reporter_name: "Rajesh Kumar",
    reporter_email: "rajesh@example.com",
    reporter_mobile: "+91 9876543210",
    department: "Public Works",
    mandal_area: "Central Zone",
    created_at: new Date("2024-01-15T10:30:00Z"),
    updated_at: new Date("2024-01-15T10:30:00Z"),
    assigned_to: null,
    resolution_notes: null
  },
  {
    id: "report-002",
    report_id: "CIV-2024-002",
    title: "Water Leakage",
    description: "Water pipe leakage causing water wastage and road damage",
    category: "Water",
    priority: "high",
    status: "in-progress",
    location: "Gandhi Nagar, Block A",
    latitude: 18.4361,
    longitude: 79.1282,
    images: ["https://via.placeholder.com/300x200?text=Water+Leak"],
    reporter_name: "Priya Sharma",
    reporter_email: "priya@example.com",
    reporter_mobile: "+91 9876543211",
    department: "Water Department",
    mandal_area: "North Zone",
    created_at: new Date("2024-01-14T14:20:00Z"),
    updated_at: new Date("2024-01-16T09:15:00Z"),
    assigned_to: "Water Department Team",
    resolution_notes: "Team dispatched, repair work in progress"
  },
  {
    id: "report-003",
    report_id: "CIV-2024-003",
    title: "Pothole on Highway",
    description: "Large pothole on National Highway causing traffic issues",
    category: "Roads",
    priority: "high",
    status: "completed",
    location: "NH-44, Near Toll Plaza",
    latitude: 18.4361,
    longitude: 79.1282,
    images: ["https://via.placeholder.com/300x200?text=Pothole"],
    reporter_name: "Amit Patel",
    reporter_email: "amit@example.com",
    reporter_mobile: "+91 9876543212",
    department: "Public Works",
    mandal_area: "South Zone",
    created_at: new Date("2024-01-10T08:45:00Z"),
    updated_at: new Date("2024-01-12T16:30:00Z"),
    assigned_to: "Road Maintenance Team",
    resolution_notes: "Pothole filled and road resurfaced"
  },
  {
    id: "report-004",
    report_id: "CIV-2024-004",
    title: "Garbage Collection Issue",
    description: "Garbage not being collected regularly in residential area",
    category: "Sanitation",
    priority: "medium",
    status: "pending",
    location: "Residential Colony, Sector 5",
    latitude: 18.4361,
    longitude: 79.1282,
    images: ["https://via.placeholder.com/300x200?text=Garbage"],
    reporter_name: "Sunita Reddy",
    reporter_email: "sunita@example.com",
    reporter_mobile: "+91 9876543213",
    department: "Sanitation Department",
    mandal_area: "East Zone",
    created_at: new Date("2024-01-16T11:00:00Z"),
    updated_at: new Date("2024-01-16T11:00:00Z"),
    assigned_to: null,
    resolution_notes: null
  }
];

export const mockDepartments = [
  "Public Works",
  "Water Department", 
  "Sanitation Department",
  "Traffic Department",
  "Parks & Recreation",
  "Health Department",
  "Education Department",
  "Administration"
];

export const mockMandalAreas = [
  "Central Zone",
  "North Zone", 
  "South Zone",
  "East Zone",
  "West Zone",
  "All Zones"
];

export const mockCategories = [
  "Infrastructure",
  "Water",
  "Roads", 
  "Sanitation",
  "Traffic",
  "Parks",
  "Health",
  "Education",
  "Other"
];

// Simple password hashing simulation (for demo purposes)
export const hashPassword = (password) => {
  // In real app, use proper bcrypt hashing
  return "$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV";
};

export const comparePassword = (password, hash) => {
  // Simple demo comparison - in real app, use bcrypt.compare
  const demoPasswords = {
    "admin123": true,
    "public123": true, 
    "water123": true,
    "mandal123": true,
    "citizen123": true,
    "password": true,
    "admin": true,
    "public": true,
    "water": true,
    "mandal": true
  };
  return demoPasswords[password] || false;
};
