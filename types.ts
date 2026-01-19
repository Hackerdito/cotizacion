export interface LineItem {
  id: string;
  description: string;
  price: number;
}

export interface Quote {
  id: string;
  quoteName: string; // New field for project/quote identifier
  clientName: string;
  date: string; // ISO string format YYYY-MM-DD
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
