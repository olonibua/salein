declare module "sib-api-v3-sdk" {
  export default class SibApiV3Sdk {
    static ApiClient: {
      instance: {
        authentications: {
          "api-key": {
            apiKey: string;
          };
        };
      };
    };
    static TransactionalEmailsApi: new () => {
      sendTransacEmail: (data: any) => Promise<any>;
    };
  }
}
