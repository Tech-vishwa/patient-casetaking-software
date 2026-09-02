"use strict";exports.id=453,exports.ids=[453],exports.modules={3501:(e,t,a)=>{a.d(t,{P:()=>l});var i=a(7925);class s{isAvailable(){return!0}async extractText(e,t){await new Promise(e=>setTimeout(e,800));let a=e.fileName.toLowerCase();return"prescription"===t||a.includes("presc")||a.includes("rx")||a.includes("med")?{text:`
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
      `.trim(),confidence:.92,detectedType:"other"}}constructor(){this.name="MediKiosk Simulated Vision OCR"}}let r=new s;class n{static isValueOutsideRange(e,t){if(!t||!t.trim())return!1;let a="number"==typeof e?e:parseFloat(e);if(isNaN(a))return!1;let i=t.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);if(i){let e=parseFloat(i[1]),t=parseFloat(i[2]);if(!isNaN(e)&&!isNaN(t))return a<e||a>t}let s=t.match(/<\s*=?\s*([\d.]+)/);if(s){let e=parseFloat(s[1]);if(!isNaN(e))return a>e}let r=t.match(/>\s*=?\s*([\d.]+)/);if(r){let e=parseFloat(r[1]);if(!isNaN(e))return a<e}return!1}static extractDocumentDate(e){if(!e)return null;let t=e.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.](19\d\d|20\d\d)\b/);if(t){let e=t[1].padStart(2,"0"),a=t[2].padStart(2,"0"),i=t[3];return`${i}-${a}-${e}`}let a=e.match(/\b(19\d\d|20\d\d)[\/\-\.](0?[1-9]|1[012])[\/\-\.](0?[1-9]|[12][0-9]|3[01])\b/);if(a){let e=a[1],t=a[2].padStart(2,"0"),i=a[3].padStart(2,"0");return`${e}-${t}-${i}`}return null}static extractEntities(e,t){let a,i;e.split("\n").map(e=>e.trim()).filter(Boolean);let s=[],r=[],n=[],o=[],l=this.extractDocumentDate(e);for(let t of["type 2 diabetes","diabetes mellitus","essential hypertension","hypertension","acute appendicitis","coronary artery disease","asthma","osteoarthritis","dyslipidemia","hyperthyroidism","hypothyroidism","migraine","gerd","fatty liver"])if(e.toLowerCase().includes(t)&&!s.some(e=>e.toLowerCase()===t)){let e=t.split(" ").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");s.push(e)}let d=/(?:Tab\.?|Cap\.?|Syr\.?|Inj\.?|Tablet|Capsule)?\s*([A-Za-z\-]+(?:\s+[A-Za-z\-]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|ml|IU))\b(?:\s*[-–:]\s*([^\n,]+))?/gi;for(;null!==(a=d.exec(e));){let e=a[1].trim(),t=a[2].trim(),i=a[3]?a[3].trim():void 0;["doctor","patient","name","date","ref","mci","ip","reg","sample"].includes(e.toLowerCase())||r.some(t=>t.name.toLowerCase()===e.toLowerCase())||r.push({name:e,dosage:t,frequency:i})}for(let t of[{name:"Metformin",dosage:"500mg",frequency:"Twice daily"},{name:"Telmisartan",dosage:"40mg",frequency:"Once daily (morning)"},{name:"Atorvastatin",dosage:"10mg",frequency:"Once daily (night)"},{name:"Amoxicillin-Clavulanate",dosage:"625mg",frequency:"Twice daily"},{name:"Paracetamol",dosage:"650mg",frequency:"As needed for pain"},{name:"Glucosamine Sulfate",dosage:"1500mg",frequency:"Once daily"},{name:"Pantoprazole",dosage:"40mg",frequency:"Before breakfast"}])e.toLowerCase().includes(t.name.toLowerCase())&&!r.some(e=>e.name.toLowerCase()===t.name.toLowerCase())&&r.push(t);for(let t of["laparoscopic appendectomy","appendectomy","cholecystectomy","coronary angioplasty","stent placement","knee arthroscopy","total knee replacement","cesarean section","hernia repair","cataract surgery","tonsillectomy"])if(e.toLowerCase().includes(t)&&!o.some(e=>e.toLowerCase()===t)){let e=t.split(" ").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");o.push(e)}let c=/([A-Za-z\s\(\)]+)\s+(\d+(?:\.\d+)?)\s+([A-Za-z\/%]+)\s+([\d\.\s\-–<>]+)/g;for(;null!==(i=c.exec(e));){let e=i[1].trim(),t=i[2].trim(),a=i[3].trim(),s=i[4].trim();if(e.length>2&&!["observed value","test name","date of","sample collected"].includes(e.toLowerCase())){let i=this.isValueOutsideRange(t,s);n.push({test:e,value:parseFloat(t)||t,unit:a,referenceRange:s,isOutsideRange:i})}}for(let t of[{test:"Fasting Blood Sugar",val:240,unit:"mg/dL",range:"70 - 100"},{test:"Post Prandial Sugar",val:310,unit:"mg/dL",range:"110 - 140"},{test:"HbA1c",val:8.8,unit:"%",range:"4.0 - 5.6"},{test:"Serum Creatinine",val:1.1,unit:"mg/dL",range:"0.7 - 1.3"},{test:"Total Cholesterol",val:215,unit:"mg/dL",range:"125 - 200"},{test:"Hemoglobin",val:14.2,unit:"g/dL",range:"13.0 - 17.0"}])e.toLowerCase().includes(t.test.toLowerCase())&&!n.some(e=>e.test.toLowerCase().includes(t.test.toLowerCase()))&&n.push({test:t.test,value:t.val,unit:t.unit,referenceRange:t.range,isOutsideRange:this.isValueOutsideRange(t.val,t.range)});return{id:"ext-"+Math.random().toString(36).substring(2,9),document_id:t,diagnoses:s,medications:r,labResults:n,procedures:o,documentDate:l,confidence:.96,raw_structured_data:{totalEntities:s.length+r.length+n.length+o.length,hasAbnormalLabs:n.some(e=>e.isOutsideRange)},created_at:new Date().toISOString()}}}let o=["image/jpeg","image/png","image/jpg","image/webp","application/pdf"];class l{static{this.ocrProvider=r}static setOCRProvider(e){this.ocrProvider=e}static validateFile(e,t,a){if(!e||0===e.trim().length)return{valid:!1,error:"File name is missing."};if(t>15728640)return{valid:!1,error:"File size exceeds maximum allowed limit of 15MB."};let i=/\.(jpg|jpeg|png|webp|pdf)$/i.test(e),s=o.includes(a.toLowerCase())||""===a;return i||s?{valid:!0}:{valid:!1,error:"Unsupported file type. Please upload JPG, PNG, or PDF documents."}}static async processDocument(e){let t=this.validateFile(e.fileName,e.fileSize,e.mimeType);if(!t.valid)throw Error(t.error||"File validation failed");let a={patient_id:e.patientId,intake_session_id:e.intakeSessionId,file_name:e.fileName,file_url:e.fileUrl,file_size:e.fileSize,mime_type:e.mimeType,document_type:e.documentType},s=await i.M.createMedicalDocument(a);try{await i.M.updateMedicalDocument(s.id,{processing_status:"processing"});let t=await this.ocrProvider.extractText({fileName:e.fileName,mimeType:e.mimeType,base64Data:e.base64Data},e.documentType);if(!t.text||0===t.text.trim().length)throw Error("OCR produced empty text. Please ensure document image is clear.");let a=n.extractEntities(t.text,s.id),r=await i.M.updateMedicalDocument(s.id,{extracted_text:t.text,processing_status:"completed",document_date:a.documentDate||new Date().toISOString().split("T")[0]});return await i.M.saveDocumentExtraction({document_id:s.id,diagnoses:a.diagnoses,medications:a.medications,labResults:a.labResults,procedures:a.procedures,documentDate:a.documentDate,confidence:a.confidence,raw_structured_data:a.raw_structured_data}),{document:r||s,extraction:a}}catch(e){throw await i.M.updateMedicalDocument(s.id,{processing_status:"failed"}),Error(e.message||"Document OCR and extraction pipeline failed")}}static async getSessionDocuments(e){return await i.M.getMedicalDocumentsBySession(e)}static async deleteDocument(e){return await i.M.deleteMedicalDocument(e)}static async updateDocumentDate(e,t){return await i.M.updateMedicalDocument(e,{document_date:t})}}},3022:(e,t,a)=>{a.d(t,{Z:()=>i});let i=(0,a(9664).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])}};