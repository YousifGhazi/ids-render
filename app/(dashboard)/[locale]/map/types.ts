export interface BranchData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  employees: number;
  address: string;
}

export interface CompanyData {
  id: number;
  name: string;
  industry: string;
  employees: number;
  revenue: string;
  headquarters: {
    lat: number;
    lng: number;
    address: string;
  };
  branches: BranchData[];
}
