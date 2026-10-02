export type CertificateItem = {
  id: string;
  number: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
};

export const certificatesData: CertificateItem[] = [
  {
    id: "cert-1",
    number: "01",
    title: "Full-Stack Web Development",
    issuer: "Meta",
    date: "10/2025",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop", 
  },
  {
    id: "cert-2",
    number: "02",
    title: "B.S. Information Technology Diploma (Cum Laude)",
    issuer: "Technological Institute of the Philippines",
    date: "06/2026",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
  },
];