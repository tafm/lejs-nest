export type CertificateReport =
  | {
      requestId: string;
      sucess: true;
      document: string;
      court: string;
      lawsuits: {
        id: string;
        location: string;
      }[];
    }
  | {
      requestId: string;
      sucess: false;
      document: string;
    };
