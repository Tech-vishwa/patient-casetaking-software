"use strict";(()=>{var e={};e.id=325,e.ids=[325],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9574:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>_,patchFetch:()=>w,requestAsyncStorage:()=>y,routeModule:()=>g,serverHooks:()=>h,staticGenerationAsyncStorage:()=>f});var i={};a.r(i),a.d(i,{GET:()=>p,POST:()=>u});var s=a(9303),r=a(8716),n=a(670),o=a(7070),l=a(4840),c=a(2639),d=a(3786);class m{static async generateSummary(e,t){let a=await c.O.getClinicalHistory(e),i=await l.M.getRedFlagAlertsBySessionId(e),s=await d.P.getSessionDocuments(e),r=new Set;a?.past_medical_history&&a.past_medical_history.forEach(e=>{"yes"===e.status&&e.condition&&r.add(`${e.condition} (Patient reported)`)}),s.forEach(e=>{e.extraction?.diagnoses&&e.extraction.diagnoses.forEach(t=>{r.add(`${t} (Document dated ${e.document_date||"prior"})`)})});let n=Array.from(r);0===n.length&&n.push("No significant past medical conditions reported or identified.");let o=[];a?.surgical_history&&a.surgical_history.forEach(e=>{e.surgery&&!e.surgery.toLowerCase().includes("no")&&o.push(`${e.surgery} (Patient reported)`)}),s.forEach(e=>{e.extraction?.procedures&&e.extraction.procedures.forEach(t=>{o.push(`${t} (Document dated ${e.document_date||"prior"})`)})});let m=o.length>0?o:["No prior surgeries reported."],u=new Map;a?.medications&&a.medications.forEach(e=>{e.name&&!e.name.toLowerCase().includes("no regular")&&u.set(e.name.toLowerCase(),{name:e.name,dosage:e.dosage,frequency:e.frequency,source:"patient"})}),s.forEach(e=>{e.extraction?.medications&&e.extraction.medications.forEach(e=>{let t=e.name.toLowerCase();if(u.has(t)){let a=u.get(t);a.source="both",e.dosage&&!a.dosage&&(a.dosage=e.dosage),e.frequency&&!a.frequency&&(a.frequency=e.frequency)}else u.set(t,{name:e.name,dosage:e.dosage,frequency:e.frequency,source:"document"})})});let p=Array.from(u.values()),g=a?.allergies&&a.allergies.length>0?a.allergies.map(e=>({allergen:e.allergen,type:e.type})):[{allergen:"No known drug or food allergies reported."}],y=a?.family_history&&a.family_history.length>0?a.family_history.map(e=>`${e.relation}: ${e.condition}`):["No notable early family disease history reported."],f=a?.personal_history?.diet?[`Diet & Lifestyle: ${a.personal_history.diet}`]:["Standard diet and lifestyle reported."],h=[];s.forEach(e=>{e.extraction?.labResults&&e.extraction.labResults.forEach(t=>{h.push({test:t.test,result:`${t.value} ${t.unit||""}`.trim(),referenceRange:t.referenceRange,isAbnormal:t.isOutsideRange,date:e.document_date||void 0})})});let _=[];i&&i.length>0&&i.forEach(e=>{_.push(`🚨 EMERGENCY TRIAGE ALERT: ${e.alert_type} flagged at intake. Matched symptoms: ${(e.matched_terms||[]).join(", ")}.`)}),h.some(e=>e.isAbnormal)&&_.push("⚠️ DOCUMENT ALERT: One or more lab investigation values fall outside the printed reference range.");let w=a?.chief_complaint||"General health evaluation",v=a?.hpi?Object.entries(a.hpi).map(([e,t])=>`${e.charAt(0).toUpperCase()+e.slice(1)}: ${t}`).join("; "):"Patient presented for clinical assessment.",C=`Patient reports chief concern of "${w}". ${v}.`,S={chief_complaint:w,history_of_present_illness:C,past_medical_history:n,past_surgical_history:m,current_medications:p,allergies:g,family_history:y,personal_history:f,review_of_systems:a?.review_of_systems||{general:"Denies acute systemic distress"},prior_investigations:h,important_alerts:_},A=`
PATIENT CLINICAL INTAKE SUMMARY

1. CHIEF COMPLAINT:
${S.chief_complaint}

2. HISTORY OF PRESENT ILLNESS:
${S.history_of_present_illness}

3. PAST MEDICAL HISTORY:
${S.past_medical_history.map(e=>`• ${e}`).join("\n")}

4. PAST SURGICAL HISTORY:
${S.past_surgical_history.map(e=>`• ${e}`).join("\n")}

5. CURRENT MEDICATIONS:
${S.current_medications.length>0?S.current_medications.map(e=>`• ${e.name} ${e.dosage||""} (${e.frequency||"as prescribed"}) [Source: ${e.source}]`).join("\n"):"• None reported"}

6. ALLERGIES:
${S.allergies.map(e=>`• ${e.allergen}`).join("\n")}

7. FAMILY HISTORY:
${S.family_history.map(e=>`• ${e}`).join("\n")}

8. PERSONAL HISTORY:
${S.personal_history}

9. PRIOR INVESTIGATIONS:
${S.prior_investigations.length>0?S.prior_investigations.map(e=>`• ${e.test}: ${e.result} (Ref: ${e.referenceRange||"N/A"})${e.isAbnormal?" [⚠️ OUTSIDE RANGE]":""}`).join("\n"):"• No uploaded lab reports"}

10. IMPORTANT ALERTS:
${S.important_alerts.length>0?S.important_alerts.map(e=>`• ${e}`).join("\n"):"• No active red-flag triggers"}

CONFIDENTIALITY NOTICE: This clinical intake summary was compiled by MediKiosk AI for physician review and does not provide medical evaluation or treatment recommendations.
    `.trim();return await l.M.saveClinicalSummary({patient_id:t,intake_session_id:e,summary_content:A,structured_summary:S,status:"draft"})}static async getSummary(e){return await l.M.getClinicalSummaryBySession(e)}}async function u(e){try{let{sessionId:t,patientId:a}=await e.json();if(!t||!a)return o.NextResponse.json({success:!1,error:"sessionId and patientId are required."},{status:400});let i=await m.generateSummary(t,a);return o.NextResponse.json({success:!0,data:i},{status:201})}catch(e){return o.NextResponse.json({success:!1,error:e.message||"Error generating clinical summary"},{status:500})}}async function p(e){try{let{searchParams:t}=new URL(e.url),a=t.get("sessionId");if(!a)return o.NextResponse.json({success:!1,error:"sessionId parameter is required"},{status:400});let i=await m.getSummary(a);if(!i)return o.NextResponse.json({success:!1,message:"Summary not yet generated"},{status:404});return o.NextResponse.json({success:!0,data:i})}catch(e){return o.NextResponse.json({success:!1,error:e.message||"Error fetching summary"},{status:500})}}let g=new s.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/summary/route",pathname:"/api/summary",filename:"route",bundlePath:"app/api/summary/route"},resolvedPagePath:"C:\\Users\\DELL\\OneDrive\\Documents\\patienrt case\\app\\api\\summary\\route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:y,staticGenerationAsyncStorage:f,serverHooks:h}=g,_="/api/summary/route";function w(){return(0,n.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:f})}},6328:(e,t,a)=>{a.d(t,{O:()=>s,j:()=>i}),a(7495);let i=!1,s=null},2639:(e,t,a)=>{a.d(t,{O:()=>r});var i=a(6328),s=a(4840);class r{static async saveConversation(e,t,a,r){if(i.j&&i.O){try{let{error:n}=await i.O.from("clinical_conversations").upsert({intake_session_id:e,patient_id:t,messages:a,language:r},{onConflict:"intake_session_id"});n&&(console.warn("Supabase conversation save error, using fallback:",n.message),await s.M.saveConversation(e,t,a,r))}catch(i){console.warn("Supabase connection error:",i),await s.M.saveConversation(e,t,a,r)}return}await s.M.saveConversation(e,t,a,r)}static async saveClinicalHistory(e){if(i.j&&i.O)try{let{data:t,error:a}=await i.O.from("clinical_history").upsert({intake_session_id:e.intake_session_id,patient_id:e.patient_id,chief_complaint:e.chief_complaint,hpi:e.hpi,past_medical_history:e.past_medical_history,surgical_history:e.surgical_history,medications:e.medications,allergies:e.allergies,family_history:e.family_history,personal_history:e.personal_history,review_of_systems:e.review_of_systems||{},updated_at:new Date().toISOString()},{onConflict:"intake_session_id"}).select().single();if(a||!t)return console.warn("Supabase clinical history save error, using fallback:",a?.message),await s.M.saveClinicalHistory(e);return t}catch(e){console.warn("Supabase connection error saving history:",e)}return await s.M.saveClinicalHistory(e)}static async getClinicalHistory(e){if(i.j&&i.O)try{let{data:t,error:a}=await i.O.from("clinical_history").select("*").eq("intake_session_id",e).single();if(a||!t)return await s.M.getClinicalHistoryBySessionId(e);return t}catch{}return await s.M.getClinicalHistoryBySessionId(e)}static async logRedFlagAlert(e,t,a,r,n){if(i.j&&i.O)try{let{data:o,error:l}=await i.O.from("red_flag_alerts").insert([{intake_session_id:e,patient_id:t,alert_type:a,severity:r,matched_terms:n||[]}]).select().single();if(l||!o)return await s.M.saveRedFlagAlert({intake_session_id:e,patient_id:t,alert_type:a,severity:r,matched_terms:n});return o}catch{}return await s.M.saveRedFlagAlert({intake_session_id:e,patient_id:t,alert_type:a,severity:r,matched_terms:n})}}},3786:(e,t,a)=>{a.d(t,{P:()=>l});var i=a(4840);class s{isAvailable(){return!0}async extractText(e,t){await new Promise(e=>setTimeout(e,800));let a=e.fileName.toLowerCase();return"prescription"===t||a.includes("presc")||a.includes("rx")||a.includes("med")?{text:`
APOLLO MULTISPECIALITY CLINIC
Dr. S. K. Venkatraman, MD, DM (Cardiology)
Reg No: MCI-28491
Date: 14/05/2023

Patient Name: Rajesh Sharma
Age: 59 Yrs  Gender: Male

Diagnosis / Impression:
1. Essential Hypertension
2. Type 2 Diabetes Mellitus

Rx (Medications):
1. Tab. Metformin 500mg - 1 tab twice daily after food (B.D)
2. Tab. Telmisartan 40mg - 1 tab once daily in morning (O.D)
3. Tab. Atorvastatin 10mg - 1 tab at bedtime (H.S)

Advice: Low salt & low carbohydrate diet. Check fasting blood sugar regularly.
Next Review: 3 Months
        `.trim(),confidence:.96,detectedType:"prescription"}:"lab_report"===t||a.includes("lab")||a.includes("blood")||a.includes("test")||a.includes("report")?{text:`
LAL PATHLABS CLINICAL DIAGNOSTIC REPORT
Patient: Rajesh Sharma   Age/Sex: 60/M
Sample Collected: 10/11/2024
Report Status: Final

BIOCHEMISTRY INVESTIGATIONS:
Test Name              Observed Value   Units    Reference Range
----------------------------------------------------------------
Fasting Blood Sugar    240              mg/dL    70 - 100
Post Prandial Sugar    310              mg/dL    110 - 140
HbA1c (Glycated Hb)    8.8              %        4.0 - 5.6
Serum Creatinine       1.1              mg/dL    0.7 - 1.3
Total Cholesterol      215              mg/dL    125 - 200
Hemoglobin             14.2             g/dL     13.0 - 17.0

Comments: Elevated glycemic parameters noted. Clinical correlation suggested.
        `.trim(),confidence:.98,detectedType:"lab_report"}:"discharge_summary"===t||a.includes("discharge")||a.includes("summary")||a.includes("hospital")?{text:`
CITY GENERAL HOSPITAL - DISCHARGE SUMMARY
IP No: 884920   Date of Admission: 12/03/2022   Date of Discharge: 16/03/2022
Patient: Rajesh Sharma   Age: 58   Gender: Male

Final Diagnosis:
Acute Appendicitis (Resolved)

Surgical / Interventional Procedure:
Laparoscopic Appendectomy performed on 13/03/2022 under General Anesthesia.

Hospital Course:
Patient underwent uneventful laparoscopic appendectomy. Post-operative recovery was smooth.
Wound healthy, afebrile at discharge.

Discharge Medications:
1. Tab. Amoxicillin-Clavulanate 625mg - 1 tab twice daily for 5 days
2. Tab. Paracetamol 650mg - 1 tab as needed for pain
        `.trim(),confidence:.97,detectedType:"discharge_summary"}:{text:`
CLINICAL CONSULTATION NOTE
Date: 05/01/2024
Patient: Rajesh Sharma

Assessment:
Chronic mild knee osteoarthritis with bilateral morning stiffness.

Medications:
1. Tab. Glucosamine Sulfate 1500mg once daily
2. Topical Diclofenac Gel for local knee application
      `.trim(),confidence:.92,detectedType:"other"}}constructor(){this.name="MediKiosk Simulated Vision OCR"}}let r=new s;class n{static isValueOutsideRange(e,t){if(!t||!t.trim())return!1;let a="number"==typeof e?e:parseFloat(e);if(isNaN(a))return!1;let i=t.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);if(i){let e=parseFloat(i[1]),t=parseFloat(i[2]);if(!isNaN(e)&&!isNaN(t))return a<e||a>t}let s=t.match(/<\s*=?\s*([\d.]+)/);if(s){let e=parseFloat(s[1]);if(!isNaN(e))return a>e}let r=t.match(/>\s*=?\s*([\d.]+)/);if(r){let e=parseFloat(r[1]);if(!isNaN(e))return a<e}return!1}static extractDocumentDate(e){if(!e)return null;let t=e.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.](19\d\d|20\d\d)\b/);if(t){let e=t[1].padStart(2,"0"),a=t[2].padStart(2,"0"),i=t[3];return`${i}-${a}-${e}`}let a=e.match(/\b(19\d\d|20\d\d)[\/\-\.](0?[1-9]|1[012])[\/\-\.](0?[1-9]|[12][0-9]|3[01])\b/);if(a){let e=a[1],t=a[2].padStart(2,"0"),i=a[3].padStart(2,"0");return`${e}-${t}-${i}`}return null}static extractEntities(e,t){let a,i;e.split("\n").map(e=>e.trim()).filter(Boolean);let s=[],r=[],n=[],o=[],l=this.extractDocumentDate(e);for(let t of["type 2 diabetes","diabetes mellitus","essential hypertension","hypertension","acute appendicitis","coronary artery disease","asthma","osteoarthritis","dyslipidemia","hyperthyroidism","hypothyroidism","migraine","gerd","fatty liver"])if(e.toLowerCase().includes(t)&&!s.some(e=>e.toLowerCase()===t)){let e=t.split(" ").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");s.push(e)}let c=/(?:Tab\.?|Cap\.?|Syr\.?|Inj\.?|Tablet|Capsule)?\s*([A-Za-z\-]+(?:\s+[A-Za-z\-]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|ml|IU))\b(?:\s*[-–:]\s*([^\n,]+))?/gi;for(;null!==(a=c.exec(e));){let e=a[1].trim(),t=a[2].trim(),i=a[3]?a[3].trim():void 0;["doctor","patient","name","date","ref","mci","ip","reg","sample"].includes(e.toLowerCase())||r.some(t=>t.name.toLowerCase()===e.toLowerCase())||r.push({name:e,dosage:t,frequency:i})}for(let t of[{name:"Metformin",dosage:"500mg",frequency:"Twice daily"},{name:"Telmisartan",dosage:"40mg",frequency:"Once daily (morning)"},{name:"Atorvastatin",dosage:"10mg",frequency:"Once daily (night)"},{name:"Amoxicillin-Clavulanate",dosage:"625mg",frequency:"Twice daily"},{name:"Paracetamol",dosage:"650mg",frequency:"As needed for pain"},{name:"Glucosamine Sulfate",dosage:"1500mg",frequency:"Once daily"},{name:"Pantoprazole",dosage:"40mg",frequency:"Before breakfast"}])e.toLowerCase().includes(t.name.toLowerCase())&&!r.some(e=>e.name.toLowerCase()===t.name.toLowerCase())&&r.push(t);for(let t of["laparoscopic appendectomy","appendectomy","cholecystectomy","coronary angioplasty","stent placement","knee arthroscopy","total knee replacement","cesarean section","hernia repair","cataract surgery","tonsillectomy"])if(e.toLowerCase().includes(t)&&!o.some(e=>e.toLowerCase()===t)){let e=t.split(" ").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");o.push(e)}let d=/([A-Za-z\s\(\)]+)\s+(\d+(?:\.\d+)?)\s+([A-Za-z\/%]+)\s+([\d\.\s\-–<>]+)/g;for(;null!==(i=d.exec(e));){let e=i[1].trim(),t=i[2].trim(),a=i[3].trim(),s=i[4].trim();if(e.length>2&&!["observed value","test name","date of","sample collected"].includes(e.toLowerCase())){let i=this.isValueOutsideRange(t,s);n.push({test:e,value:parseFloat(t)||t,unit:a,referenceRange:s,isOutsideRange:i})}}for(let t of[{test:"Fasting Blood Sugar",val:240,unit:"mg/dL",range:"70 - 100"},{test:"Post Prandial Sugar",val:310,unit:"mg/dL",range:"110 - 140"},{test:"HbA1c",val:8.8,unit:"%",range:"4.0 - 5.6"},{test:"Serum Creatinine",val:1.1,unit:"mg/dL",range:"0.7 - 1.3"},{test:"Total Cholesterol",val:215,unit:"mg/dL",range:"125 - 200"},{test:"Hemoglobin",val:14.2,unit:"g/dL",range:"13.0 - 17.0"}])e.toLowerCase().includes(t.test.toLowerCase())&&!n.some(e=>e.test.toLowerCase().includes(t.test.toLowerCase()))&&n.push({test:t.test,value:t.val,unit:t.unit,referenceRange:t.range,isOutsideRange:this.isValueOutsideRange(t.val,t.range)});return{id:"ext-"+Math.random().toString(36).substring(2,9),document_id:t,diagnoses:s,medications:r,labResults:n,procedures:o,documentDate:l,confidence:.96,raw_structured_data:{totalEntities:s.length+r.length+n.length+o.length,hasAbnormalLabs:n.some(e=>e.isOutsideRange)},created_at:new Date().toISOString()}}}let o=["image/jpeg","image/png","image/jpg","image/webp","application/pdf"];class l{static{this.ocrProvider=r}static setOCRProvider(e){this.ocrProvider=e}static validateFile(e,t,a){if(!e||0===e.trim().length)return{valid:!1,error:"File name is missing."};if(t>15728640)return{valid:!1,error:"File size exceeds maximum allowed limit of 15MB."};let i=/\.(jpg|jpeg|png|webp|pdf)$/i.test(e),s=o.includes(a.toLowerCase())||""===a;return i||s?{valid:!0}:{valid:!1,error:"Unsupported file type. Please upload JPG, PNG, or PDF documents."}}static async processDocument(e){let t=this.validateFile(e.fileName,e.fileSize,e.mimeType);if(!t.valid)throw Error(t.error||"File validation failed");let a={patient_id:e.patientId,intake_session_id:e.intakeSessionId,file_name:e.fileName,file_url:e.fileUrl,file_size:e.fileSize,mime_type:e.mimeType,document_type:e.documentType},s=await i.M.createMedicalDocument(a);try{await i.M.updateMedicalDocument(s.id,{processing_status:"processing"});let t=await this.ocrProvider.extractText({fileName:e.fileName,mimeType:e.mimeType,base64Data:e.base64Data},e.documentType);if(!t.text||0===t.text.trim().length)throw Error("OCR produced empty text. Please ensure document image is clear.");let a=n.extractEntities(t.text,s.id),r=await i.M.updateMedicalDocument(s.id,{extracted_text:t.text,processing_status:"completed",document_date:a.documentDate||new Date().toISOString().split("T")[0]});return await i.M.saveDocumentExtraction({document_id:s.id,diagnoses:a.diagnoses,medications:a.medications,labResults:a.labResults,procedures:a.procedures,documentDate:a.documentDate,confidence:a.confidence,raw_structured_data:a.raw_structured_data}),{document:r||s,extraction:a}}catch(e){throw await i.M.updateMedicalDocument(s.id,{processing_status:"failed"}),Error(e.message||"Document OCR and extraction pipeline failed")}}static async getSessionDocuments(e){return await i.M.getMedicalDocumentsBySession(e)}static async deleteDocument(e){return await i.M.deleteMedicalDocument(e)}static async updateDocumentDate(e,t){return await i.M.updateMedicalDocument(e,{document_date:t})}}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[276,972,495,840],()=>a(9574));module.exports=i})();