
export interface LineItem {
  id: string;
  description: string;
  price: number;
  isUnitPrice?: boolean; // New optional field to toggle "C/U" display
}

export interface Quote {
  id: string;
  quoteName: string; 
  clientName: string;
  date: string; 
  items: LineItem[];
  createdAt: number;
  updatedAt: number;
}

export const COMPANY_INFO = {
  name: "IMPRESOS URIBE",
  contactName: "Francisco Rodríguez Uribe",
  phone: "55 3208 5670",
  email: "fru_27@hotmail.com",
};
