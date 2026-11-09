 export interface Counterparty {   
    key:string;
    name:string;
    kind:string;
    roles:string[];
    phone:string;
    inn:string;
    pinfl:string | null;
    rows:number;
    since:string;
    has_duplicates:boolean;
 }
 