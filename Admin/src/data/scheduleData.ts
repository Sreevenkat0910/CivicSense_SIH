import { addDays, subDays } from "date-fns";

export interface BaseScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  assignedTo: string;
  location: string;
  department: string;
  createdBy: string;
  createdAt: Date;
}

export interface MandalScheduleItem extends BaseScheduleItem {
  mandalArea: string;
  supervisor: string;
  mandalName: string;
}

export type ScheduleItem = BaseScheduleItem | MandalScheduleItem;

// Mock data for different roles and departments
export const mockScheduleData: {
  admin: BaseScheduleItem[];
  departments: Record<string, BaseScheduleItem[]>;
  mandals: Record<string, MandalScheduleItem[]>;
} = {
  // Admin sees all schedules across all departments
  admin: [
    {
      id: "admin-1",
      title: "City-wide Infrastructure Audit",
      description: "Comprehensive audit of all city infrastructure",
      startTime: "08:00",
      endTime: "17:00",
      date: new Date(),
      priority: "high",
      status: "in-progress",
      assignedTo: "All Department Heads",
      location: "City Hall",
      department: "Administration",
      createdBy: "admin",
      createdAt: subDays(new Date(), 2)
    },
    {
      id: "admin-2",
      title: "Emergency Response Drill",
      description: "City-wide emergency response simulation",
      startTime: "09:00",
      endTime: "15:00",
      date: addDays(new Date(), 1),
      priority: "high",
      status: "pending",
      assignedTo: "Emergency Services",
      location: "Emergency Operations Center",
      department: "Emergency Services",
      createdBy: "admin",
      createdAt: subDays(new Date(), 1)
    },
    {
      id: "admin-3",
      title: "Budget Planning Meeting",
      description: "Annual budget planning and allocation",
      startTime: "10:00",
      endTime: "16:00",
      date: addDays(new Date(), 3),
      priority: "medium",
      status: "pending",
      assignedTo: "Finance Department",
      location: "City Hall Conference Room",
      department: "Finance",
      createdBy: "admin",
      createdAt: new Date()
    }
  ],

  // Department-specific schedules
  departments: {
    "Public Works": [
      {
        id: "pw-1",
        title: "Road Maintenance - Main Street",
        description: "Pothole repair and resurfacing work",
        startTime: "08:00",
        endTime: "16:00",
        date: new Date(),
        priority: "high",
        status: "pending",
        assignedTo: "Public Works Team A",
        location: "Main Street, Downtown",
        department: "Public Works",
        createdBy: "public",
        createdAt: subDays(new Date(), 1)
      },
      {
        id: "pw-2",
        title: "Bridge Inspection",
        description: "Quarterly bridge safety inspection",
        startTime: "09:00",
        endTime: "14:00",
        date: addDays(new Date(), 2),
        priority: "high",
        status: "pending",
        assignedTo: "Bridge Inspection Team",
        location: "Central Bridge",
        department: "Public Works",
        createdBy: "public",
        createdAt: new Date()
      },
      {
        id: "pw-3",
        title: "Drainage System Cleaning",
        description: "Monthly drainage system maintenance",
        startTime: "07:00",
        endTime: "12:00",
        date: addDays(new Date(), 1),
        priority: "medium",
        status: "pending",
        assignedTo: "Maintenance Crew",
        location: "Industrial Area",
        department: "Public Works",
        createdBy: "public",
        createdAt: subDays(new Date(), 2)
      }
    ],
    "Water Department": [
      {
        id: "wd-1",
        title: "Water Quality Testing",
        description: "Weekly water quality assessment",
        startTime: "08:30",
        endTime: "12:30",
        date: new Date(),
        priority: "high",
        status: "in-progress",
        assignedTo: "Water Quality Team",
        location: "Water Treatment Plant",
        department: "Water Department",
        createdBy: "water",
        createdAt: subDays(new Date(), 1)
      },
      {
        id: "wd-2",
        title: "Pipeline Maintenance",
        description: "Scheduled pipeline inspection and repair",
        startTime: "09:00",
        endTime: "15:00",
        date: addDays(new Date(), 1),
        priority: "medium",
        status: "pending",
        assignedTo: "Pipeline Team",
        location: "North Zone Pipeline",
        department: "Water Department",
        createdBy: "water",
        createdAt: new Date()
      },
      {
        id: "wd-3",
        title: "Water Meter Reading",
        description: "Monthly water meter reading and billing",
        startTime: "08:00",
        endTime: "17:00",
        date: addDays(new Date(), 3),
        priority: "low",
        status: "pending",
        assignedTo: "Meter Reading Team",
        location: "Residential Areas",
        department: "Water Department",
        createdBy: "water",
        createdAt: subDays(new Date(), 3)
      }
    ],
    "Utilities": [
      {
        id: "ut-1",
        title: "Street Light Maintenance",
        description: "Routine street light inspection and repair",
        startTime: "09:00",
        endTime: "12:00",
        date: new Date(),
        priority: "medium",
        status: "pending",
        assignedTo: "Electrical Team",
        location: "Oak Avenue",
        department: "Utilities",
        createdBy: "utilities",
        createdAt: subDays(new Date(), 1)
      },
      {
        id: "ut-2",
        title: "Power Grid Inspection",
        description: "Monthly power grid safety inspection",
        startTime: "10:00",
        endTime: "16:00",
        date: addDays(new Date(), 2),
        priority: "high",
        status: "pending",
        assignedTo: "Power Grid Team",
        location: "Main Power Station",
        department: "Utilities",
        createdBy: "utilities",
        createdAt: new Date()
      }
    ],
    "Traffic Department": [
      {
        id: "td-1",
        title: "Traffic Signal Maintenance",
        description: "Software update and hardware check",
        startTime: "10:00",
        endTime: "14:00",
        date: subDays(new Date(), 1),
        priority: "high",
        status: "completed",
        assignedTo: "Traffic Maintenance Team",
        location: "Broadway & 5th Street",
        department: "Traffic Department",
        createdBy: "traffic",
        createdAt: subDays(new Date(), 3)
      },
      {
        id: "td-2",
        title: "Traffic Flow Analysis",
        description: "Weekly traffic pattern analysis",
        startTime: "08:00",
        endTime: "12:00",
        date: addDays(new Date(), 1),
        priority: "medium",
        status: "pending",
        assignedTo: "Traffic Analysis Team",
        location: "City Center",
        department: "Traffic Department",
        createdBy: "traffic",
        createdAt: subDays(new Date(), 2)
      }
    ],
    "Parks & Recreation": [
      {
        id: "pr-1",
        title: "Park Cleanup",
        description: "General cleanup and landscaping",
        startTime: "07:00",
        endTime: "11:00",
        date: addDays(new Date(), 2),
        priority: "low",
        status: "pending",
        assignedTo: "Parks Maintenance Team",
        location: "Central Park",
        department: "Parks & Recreation",
        createdBy: "parks",
        createdAt: new Date()
      },
      {
        id: "pr-2",
        title: "Playground Equipment Inspection",
        description: "Safety inspection of playground equipment",
        startTime: "09:00",
        endTime: "13:00",
        date: addDays(new Date(), 3),
        priority: "medium",
        status: "pending",
        assignedTo: "Safety Inspection Team",
        location: "Children's Park",
        department: "Parks & Recreation",
        createdBy: "parks",
        createdAt: subDays(new Date(), 1)
      }
    ]
  },

  // Mandal-specific schedules
  mandals: {
    "Karimnagar": [
      {
        id: "mandal-k-1",
        title: "Mandal-wide Road Maintenance",
        description: "Comprehensive road repair across all mandal areas",
        startTime: "08:00",
        endTime: "17:00",
        date: new Date(),
        priority: "high",
        status: "in-progress",
        assignedTo: "All Public Works Teams",
        location: "Karimnagar Mandal",
        department: "Public Works",
        mandalArea: "Central Zone",
        supervisor: "Rajesh Kumar",
        mandalName: "Karimnagar",
        createdBy: "mandal",
        createdAt: subDays(new Date(), 2)
      },
      {
        id: "mandal-k-2",
        title: "Water Supply System Inspection",
        description: "Quarterly inspection of water supply infrastructure",
        startTime: "09:00",
        endTime: "15:00",
        date: addDays(new Date(), 1),
        priority: "high",
        status: "pending",
        assignedTo: "Water Department Team",
        location: "All Mandal Areas",
        department: "Water Department",
        mandalArea: "All Zones",
        supervisor: "Priya Sharma",
        mandalName: "Karimnagar",
        createdBy: "mandal",
        createdAt: subDays(new Date(), 1)
      },
      {
        id: "mandal-k-3",
        title: "Department Head Meeting",
        description: "Monthly coordination meeting with all department heads",
        startTime: "10:00",
        endTime: "12:00",
        date: subDays(new Date(), 1),
        priority: "medium",
        status: "completed",
        assignedTo: "All Department Heads",
        location: "Mandal Office",
        department: "Administration",
        mandalArea: "Central Zone",
        supervisor: "Rajesh Kumar",
        mandalName: "Karimnagar",
        createdBy: "mandal",
        createdAt: subDays(new Date(), 3)
      },
      {
        id: "mandal-k-4",
        title: "Public Works Training Session",
        description: "Safety training for public works staff",
        startTime: "14:00",
        endTime: "16:00",
        date: addDays(new Date(), 2),
        priority: "medium",
        status: "pending",
        assignedTo: "Public Works Staff",
        location: "Training Center",
        department: "Public Works",
        mandalArea: "Central Zone",
        supervisor: "Amit Patel",
        mandalName: "Karimnagar",
        createdBy: "mandal",
        createdAt: new Date()
      },
      {
        id: "mandal-k-5",
        title: "Mandal Health Camp",
        description: "Free health checkup camp for citizens",
        startTime: "08:00",
        endTime: "18:00",
        date: addDays(new Date(), 3),
        priority: "high",
        status: "pending",
        assignedTo: "Health Department",
        location: "Community Center",
        department: "Health Department",
        mandalArea: "North Zone",
        supervisor: "Dr. Sunita Reddy",
        mandalName: "Karimnagar",
        createdBy: "mandal",
        createdAt: subDays(new Date(), 2)
      }
    ],
    "Warangal": [
      {
        id: "mandal-w-1",
        title: "Warangal Infrastructure Development",
        description: "New infrastructure development projects",
        startTime: "08:00",
        endTime: "16:00",
        date: new Date(),
        priority: "high",
        status: "in-progress",
        assignedTo: "Infrastructure Team",
        location: "Warangal Mandal",
        department: "Public Works",
        mandalArea: "East Zone",
        supervisor: "Vikram Singh",
        mandalName: "Warangal",
        createdBy: "mandal",
        createdAt: subDays(new Date(), 1)
      },
      {
        id: "mandal-w-2",
        title: "Water Conservation Program",
        description: "Community water conservation awareness program",
        startTime: "10:00",
        endTime: "14:00",
        date: addDays(new Date(), 2),
        priority: "medium",
        status: "pending",
        assignedTo: "Water Conservation Team",
        location: "Community Centers",
        department: "Water Department",
        mandalArea: "All Zones",
        supervisor: "Anita Desai",
        mandalName: "Warangal",
        createdBy: "mandal",
        createdAt: new Date()
      }
    ]
  }
};

// Helper functions for role-based data filtering
export const getScheduleDataForRole = (
  userRole: "admin" | "department" | "mandal-admin",
  userDepartment?: string,
  mandalName?: string
): ScheduleItem[] => {
  switch (userRole) {
    case "admin":
      // Admin sees all schedules across all departments
      const allSchedules: ScheduleItem[] = [...mockScheduleData.admin];
      
      // Add all department schedules
      Object.values(mockScheduleData.departments).forEach(deptSchedules => {
        allSchedules.push(...deptSchedules);
      });
      
      // Add all mandal schedules
      Object.values(mockScheduleData.mandals).forEach(mandalSchedules => {
        allSchedules.push(...mandalSchedules);
      });
      
      return allSchedules;

    case "department":
      // Department users only see their department's schedules
      if (!userDepartment) return [];
      return mockScheduleData.departments[userDepartment] || [];

    case "mandal-admin":
      // Mandal admin sees all schedules within their mandal
      if (!mandalName) return [];
      return mockScheduleData.mandals[mandalName] || [];

    default:
      return [];
  }
};

export const canManageSchedule = (
  userRole: "admin" | "department" | "mandal-admin",
  scheduleItem: ScheduleItem,
  userDepartment?: string,
  mandalName?: string
): boolean => {
  switch (userRole) {
    case "admin":
      // Admin can manage all schedules
      return true;

    case "department":
      // Department users can only manage their department's schedules
      return scheduleItem.department === userDepartment;

    case "mandal-admin":
      // Mandal admin can manage all schedules within their mandal
      if ('mandalName' in scheduleItem) {
        return scheduleItem.mandalName === mandalName;
      }
      return false;

    default:
      return false;
  }
};

export const getAvailableDepartments = (userRole: "admin" | "department" | "mandal-admin"): string[] => {
  const allDepartments = [
    "Public Works",
    "Water Department", 
    "Utilities",
    "Traffic Department",
    "Parks & Recreation",
    "Health Department",
    "Education Department",
    "Administration",
    "Finance",
    "Emergency Services"
  ];

  switch (userRole) {
    case "admin":
      return allDepartments;
    case "department":
      return []; // Department users can't assign to other departments
    case "mandal-admin":
      return allDepartments; // Mandal admin can assign to any department
    default:
      return [];
  }
};

export const getAvailableMandalAreas = (mandalName?: string): string[] => {
  const allAreas = [
    "Central Zone",
    "North Zone", 
    "South Zone",
    "East Zone",
    "West Zone",
    "All Zones"
  ];

  return allAreas;
};

