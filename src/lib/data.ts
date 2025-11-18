export type WasteApplication = {
  applicationId: string;
  address: string;
  latitude: number;
  longitude: number;
  wasteType: string;
  quantity: string;
  department: string;
  submissionDate: string;
  status: 'Pending' | 'Collected' | 'Rejected';
  user: string;
  userEmail: string;
};

export const MOCK_APPLICATIONS: WasteApplication[] = [
  {
    applicationId: 'APP-001',
    address: '123 Main St, Springfield, IL',
    latitude: 39.7817,
    longitude: -89.6501,
    wasteType: 'Recyclable',
    quantity: '10 kg',
    department: 'Facilities',
    submissionDate: '2024-07-20',
    status: 'Pending',
    user: 'Department User',
    userEmail: 'user@example.com',
  },
  {
    applicationId: 'APP-002',
    address: '456 Oak Ave, Springfield, IL',
    latitude: 39.7900,
    longitude: -89.6441,
    wasteType: 'General Waste',
    quantity: '25 kg',
    department: 'Cafeteria',
    submissionDate: '2024-07-19',
    status: 'Collected',
    user: 'Department User',
    userEmail: 'user@example.com',
  },
  {
    applicationId: 'APP-003',
    address: '789 Pine Ln, Springfield, IL',
    latitude: 39.7750,
    longitude: -89.6600,
    wasteType: 'Hazardous',
    quantity: '2 kg',
    department: 'Science Lab',
    submissionDate: '2024-07-18',
    status: 'Pending',
    user: 'Admin User',
    userEmail: 'jpratap731@gmail.com',
  },
  {
    applicationId: 'APP-004',
    address: '101 Maple Dr, Springfield, IL',
    latitude: 39.8012,
    longitude: -89.6523,
    wasteType: 'Recyclable',
    quantity: '15 kg',
    department: 'Library',
    submissionDate: '2024-07-21',
    status: 'Pending',
    user: 'Admin User',
    userEmail: 'jpratap731@gmail.com',
  },
    {
    applicationId: 'APP-005',
    address: '212 Birch Rd, Springfield, IL',
    latitude: 39.7689,
    longitude: -89.6311,
    wasteType: 'Organic',
    quantity: '50 kg',
    department: 'Cafeteria',
    submissionDate: '2024-07-22',
    status: 'Pending',
    user: 'Department User',
    userEmail: 'user@example.com',
  },
];
