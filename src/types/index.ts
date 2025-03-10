export interface RaffleEntry {
  id: string;
  name: string;
  whatsapp: string;
  slotNumber: number;
  paid: boolean;
  createdAt: Date;
}

export interface RaffleSlot {
  number: number;
  taken: boolean;
  entry?: RaffleEntry;
}
