export type User = {
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export type WasteApplication = {
  id: string;
  userId: string;
  userEmail: string;
  departmentId: string;
  submissionDate: string;
  wasteType: string;
  quantity: number;
  locationLongitude?: number;
  locationLatitude?: number;
  address: string;
  status: 'submitted' | 'approved' | 'rejected';
  notes?: string;
  isVerified?: boolean;
  verificationNotes?: string;
};
