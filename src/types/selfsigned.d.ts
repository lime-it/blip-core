declare module 'selfsigned'{
    interface GeneratedPems {
        private:string;
        public:string;
        cert:string;
    }

    interface KeyPair{
        name:string;
        value:string;
    }

    interface GeneratePemsOptions{
        keySize:number;
        days:number;
        algorithm:'sha256'
    }

    function generate(props:KeyPair[],options:GeneratePemsOptions):GeneratedPems;
}