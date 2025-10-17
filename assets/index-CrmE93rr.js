import{ar as m,ba as b,bb as h,bd as w,bc as p,b9 as y,b8 as g}from"./index-AyxngnCi.js";class r extends Error{constructor(e){super(e.message),this.message=e.message,this.code=e.code,this.data=e.data}}const c=(s,e)=>{let t;s.request?t=s.request.bind(s):s.sendAsync&&(t=d(s));const i=async({method:n,params:o})=>{const a=n;if(e&&e[a]===null)throw new r({code:4200,message:`The Provider does not support the requested method: ${n}`});if(e&&e[a])return e[a]({baseRequest:t,params:o});if(t)return t({method:n,params:o});throw new r({code:4200,message:`The Provider does not support the requested method: ${n}`})};return s.request=i,s},d=s=>({method:e,params:t})=>new Promise((i,n)=>{s.sendAsync({id:0,jsonrpc:"2.0",method:e,params:t},(o,{result:a})=>{o?n(JSON.parse(o)):i(a??null)})}),f=`
@font-face {
  font-family: 'Inter';
  font-style:  normal;
  font-weight: 300 600;
  font-display: swap;
  src: url("https://rsms.me/inter/font-files/InterVariable.woff2") format("woff2-variations");
}
`;export{f as InterVar,r as ProviderRpcError,m as ProviderRpcErrorCode,b as chainIdValidation,h as chainNamespaceValidation,w as chainValidation,c as createEIP1193Provider,p as providerConnectionInfoValidation,y as validate,g as weiToEth};
