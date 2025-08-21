import type { OrganizationMapData } from "../types";

// Mock organization data for Iraq
export const mockOrganizations: OrganizationMapData[] = [
  {
    id: 1,
    name: "Ministry of Health",
    type: "ministry",
    description: "Government ministry responsible for healthcare services across Iraq",
    headquarters: {
      lat: 33.3152,
      lng: 44.3661,
      address: "Baghdad, Iraq - Ministry Complex"
    },
    employees: 45000,
    branches: [
      {
        id: 101,
        name: "Baghdad Medical Center",
        lat: 33.325,
        lng: 44.422,
        employees: 2500,
        address: "Al-Rusafa, Baghdad",
        organizationId: 1
      },
      {
        id: 102,
        name: "Basra General Hospital",
        lat: 30.5085,
        lng: 47.7804,
        employees: 1800,
        address: "Basra City Center, Basra",
        organizationId: 1
      },
      {
        id: 103,
        name: "Erbil Medical Complex",
        lat: 36.1911,
        lng: 44.0092,
        employees: 1200,
        address: "Erbil, Kurdistan Region",
        organizationId: 1
      }
    ]
  },
  {
    id: 2,
    name: "Iraqi National Oil Company",
    type: "company",
    description: "Leading oil and gas company in Iraq, responsible for exploration and production",
    headquarters: {
      lat: 33.2778,
      lng: 44.3661,
      address: "Oil Ministry Complex, Baghdad"
    },
    employees: 25000,
    revenue: "$15.2B",
    website: "https://inoc.gov.iq",
    branches: [
      {
        id: 201,
        name: "Rumaila Oil Field",
        lat: 30.4,
        lng: 47.5,
        employees: 3500,
        address: "Rumaila, Basra Governorate",
        organizationId: 2
      },
      {
        id: 202,
        name: "Kirkuk Operations",
        lat: 35.4681,
        lng: 44.3922,
        employees: 2800,
        address: "Kirkuk City, Kirkuk Governorate",
        organizationId: 2
      },
      {
        id: 203,
        name: "West Qurna Field",
        lat: 31.0,
        lng: 47.3,
        employees: 2200,
        address: "West Qurna, Basra",
        organizationId: 2
      }
    ]
  },
  {
    id: 3,
    name: "University of Baghdad",
    type: "institution",
    description: "Oldest and largest university in Iraq, established in 1957",
    headquarters: {
      lat: 33.2947,
      lng: 44.3706,
      address: "Jadriya Campus, Baghdad"
    },
    employees: 8500,
    website: "https://uobaghdad.edu.iq",
    branches: [
      {
        id: 301,
        name: "College of Medicine",
        lat: 33.295,
        lng: 44.375,
        employees: 650,
        address: "Medical Campus, Baghdad",
        organizationId: 3
      },
      {
        id: 302,
        name: "College of Engineering",
        lat: 33.293,
        lng: 44.368,
        employees: 480,
        address: "Engineering Campus, Baghdad",
        organizationId: 3
      }
    ]
  },
  {
    id: 4,
    name: "Zain Iraq",
    type: "company",
    description: "Leading telecommunications company providing mobile and internet services",
    headquarters: {
      lat: 33.3069,
      lng: 44.3889,
      address: "Karrada, Baghdad"
    },
    employees: 3200,
    revenue: "$850M",
    website: "https://iq.zain.com",
    branches: [
      {
        id: 401,
        name: "Basra Regional Office",
        lat: 30.5085,
        lng: 47.7804,
        employees: 450,
        address: "Basra Commercial District",
        organizationId: 4
      },
      {
        id: 402,
        name: "Erbil Operations Center",
        lat: 36.1911,
        lng: 44.0092,
        employees: 380,
        address: "Erbil Downtown, Kurdistan",
        organizationId: 4
      },
      {
        id: 403,
        name: "Najaf Service Center",
        lat: 32.0254,
        lng: 44.3219,
        employees: 280,
        address: "Najaf City Center",
        organizationId: 4
      }
    ]
  },
  {
    id: 5,
    name: "Ministry of Education",
    type: "ministry",
    description: "Government ministry overseeing education system in Iraq",
    headquarters: {
      lat: 33.3200,
      lng: 44.3500,
      address: "Baghdad Government District"
    },
    employees: 125000,
    branches: [
      {
        id: 501,
        name: "Baghdad Education Directorate",
        lat: 33.325,
        lng: 44.355,
        employees: 15000,
        address: "Baghdad Education Complex",
        organizationId: 5
      },
      {
        id: 502,
        name: "Mosul Education Office",
        lat: 36.3350,
        lng: 43.1189,
        employees: 8500,
        address: "Mosul City, Nineveh",
        organizationId: 5
      }
    ]
  },
  {
    id: 6,
    name: "Central Bank of Iraq",
    type: "institution",
    description: "Central banking institution of Iraq",
    headquarters: {
      lat: 33.3028,
      lng: 44.3914,
      address: "Rasheed Street, Baghdad"
    },
    employees: 1200,
    website: "https://cbi.iq",
    branches: [
      {
        id: 601,
        name: "Basra Branch",
        lat: 30.5085,
        lng: 47.7804,
        employees: 150,
        address: "Basra Financial District",
        organizationId: 6
      },
      {
        id: 602,
        name: "Erbil Branch",
        lat: 36.1911,
        lng: 44.0092,
        employees: 120,
        address: "Erbil Banking Quarter",
        organizationId: 6
      }
    ]
  }
];
