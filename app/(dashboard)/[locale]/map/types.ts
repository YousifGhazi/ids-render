export interface BranchData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  employees: number;
  address: string;
  organizationId: number;
}

export interface OrganizationMapData {
  id: number;
  name: string;
  type: 'company' | 'ministry' | 'institution' | 'other';
  description: string;
  logo?: string;
  website?: string;
  headquarters: {
    lat: number;
    lng: number;
    address: string;
  };
  branches: BranchData[];
  employees: number;
  revenue?: string;
}

export interface MapState {
  selectedOrganization: OrganizationMapData | null;
  hoveredOrganization: OrganizationMapData | null;
}
