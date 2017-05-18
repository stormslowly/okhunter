interface Channels {
    [key: string]: (info: any) => void
}


declare module "okcoin-ws" {
    export = OKCoin

    namespace OKCoin {}

    class OKCoin {
        constructor(site: 'cn' | 'com', apiKey: string, secretKey: string, channel?: any);

        subscribe(channels: Channels): void;
    }
}


