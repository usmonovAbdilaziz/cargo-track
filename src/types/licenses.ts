export interface owner {
  name: string;
  address: string;
}
export interface vehicle {
  plate: string;
  kind: string;
  model: string;
}
export interface driver {
  name: string;
}
export interface files {
  stamp: string;
  scan1: string;
}

export interface License {
  id: string;
  series: string;
  number: string;
  owner: owner;
  vehicle: vehicle;
  driver: driver;
  valid_to: string;
  files: string[];
  issuer: string;
}

export interface LicenseResponse {
  data: {
    licenses: License[];
  };
}
