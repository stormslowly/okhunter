interface Channels {
    [key: string]: (info: any) => void
}


declare module "okcoin-ws" {
    export = OKCoin

	import ws = require 'ws'

    namespace OKCoin {}

    class OKCoin {
    	ws 
        constructor(site: 'cn' | 'com', apiKey: string, secretKey: string, channel?: any);

        subscribe(channels: Channels): void;
    }
}


