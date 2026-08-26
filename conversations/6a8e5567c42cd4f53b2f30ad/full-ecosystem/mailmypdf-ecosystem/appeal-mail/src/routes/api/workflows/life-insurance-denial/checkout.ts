import { createFileRoute } from "@tanstack/react-router";
import { requireAuthenticatedUser, getSupabaseServer } from "@/platform/supabase";

const PRICES={standard:549,certified:1249,registered:2999} as const;
const LABELS={standard:"Standard Mailing",certified:"Certified Mailing",registered:"Registered Mailing"} as const;
const PREPARATION_FEE=2499;
const INCLUDED_RESPONSE_PAGES=3;
const RESPONSE_PAGE_PRICE=45;
const SUPPORTING_PAGE_PRICE=25;
const LARGE_PACKET_FEE=250;
const LARGE_PACKET_THRESHOLD_SHEETS=7;

export const Route=createFileRoute("/api/workflows/life-insurance-denial/checkout")({server:{handlers:{POST:async({request})=>{try{
 const user=await requireAuthenticatedUser(request); const input=await request.json() as any; if(!input.appealId)return Response.json({error:"Appeal id is required."},{status:400});
 const s=await getSupabaseServer(); const {data:a,error}=await s.from("appeals").select("*").eq("id",input.appealId).single(); if(error||!a)return Response.json({error:"Appeal case not found."},{status:404});
 if(a.user_id!==user.id)return Response.json({error:"You do not own this appeal case."},{status:403}); if(a.workflow_id!=="life-insurance-denial")return Response.json({error:"Appeal workflow mismatch."},{status:409});
 if(a.status!=="ready"||!a.review||!a.packet)return Response.json({error:"Appeal is not approved and ready for payment."},{status:409});
 const method=a.packet.mailingMethod as keyof typeof PRICES; if(!PRICES[method])return Response.json({error:"Invalid mailing method."},{status:409});
 const responsePages=Math.max(1,Number(a.packet.responsePageCount||1)); const supportingPages=Math.max(0,Number(a.packet.supportingPageCount||Math.max(0,(a.evidence||[]).length)));
 const responseSheets=Math.max(0,responsePages-INCLUDED_RESPONSE_PAGES); const totalSheets=responsePages+supportingPages;
 const largePacket=totalSheets>LARGE_PACKET_THRESHOLD_SHEETS;
 const total=PREPARATION_FEE + responseSheets*RESPONSE_PAGE_PRICE + supportingPages*SUPPORTING_PAGE_PRICE + PRICES[method] + (largePacket?LARGE_PACKET_FEE:0);
 const {default:Stripe}=await import("stripe"); const key=process.env.STRIPE_SECRET_KEY; if(!key)return Response.json({error:"Stripe is not configured."},{status:503});
 const stripe=new Stripe(key,{apiVersion:"2024-06-20" as Stripe.LatestApiVersion}); const appUrl=process.env.APP_URL||"https://appeal-mail.pages.dev";
 const session=await stripe.checkout.sessions.create({mode:"payment",payment_method_types:["card"],line_items:[{price_data:{currency:"usd",product_data:{name:"Life Insurance Denial Appeal Packet",description:`${responsePages} response pages + ${supportingPages} supporting pages + ${LABELS[method]}`},unit_amount:total},quantity:1}],metadata:{appeal_id:a.id,workflow_id:"life-insurance-denial",mailing_method:method,response_pages:String(responsePages),supporting_pages:String(supportingPages),total_sheets:String(totalSheets),owner_user_id:user.id} ,success_url:`${appUrl}/workflows/life-insurance-denial?checkout=success&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${appUrl}/workflows/life-insurance-denial?checkout=cancelled`});
 return Response.json({ok:true,sessionId:session.id,url:session.url,pricing:{preparationFee:PREPARATION_FEE/100,responsePages,supportingPages,responsePagePrice:RESPONSE_PAGE_PRICE/100,supportingPagePrice:SUPPORTING_PAGE_PRICE/100,mailing:PRICES[method]/100,largePacketFee:largePacket?LARGE_PACKET_FEE/100:0,total:total/100}});
}catch(error){const message=error instanceof Error?error.message:"Unable to create checkout session.";return Response.json({error:message},{status:/authentication|required|token/i.test(message)?401:502});}}}}});
